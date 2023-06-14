import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  Children,
  isValidElement,
  type ReactElement,
} from "react";
import ResizeObserver from "rc-resize-observer";

import { SplitViewPaneInfo, SplitViewProps, SplitViewSashState } from "./types";
import { DEFAULT_SASH_SIZE, DEFAULT_SNAP_THRESHOLD_SIZE, DEFAULT_HOVER_DELAY } from "./constants";
import { SplitViewProvider, PaneData } from "./context";
import { SplitViewSash } from "./SplitViewSash";

const isPaneEquals = (pane1: SplitViewPaneInfo, pane2: SplitViewPaneInfo) => {
  return (
    pane1.maxSize === pane2.maxSize &&
    pane1.minSize === pane2.minSize &&
    pane1.paneKey === pane2.paneKey &&
    pane1.priority === pane2.priority &&
    // pane1.size === pane2.size &&
    pane1.snapable === pane2.snapable &&
    pane1.snapped === pane2.snapped &&
    pane1.snappedSize === pane2.snappedSize
  );
};

const relayout = (containerSize: number, paneData: SplitViewPaneInfo[]) => {
  const allHaveMaxSizePanes = paneData.filter(
    (x) => x.maxSize && x.maxSize > 0 && x.maxSize !== Number.POSITIVE_INFINITY
  ).length;

  paneData.forEach((pane, index) => {
    let size = pane.size;
    const minSize = pane.minSize || 0;
    let maxSize: number = pane.maxSize || Number.POSITIVE_INFINITY;
    pane.snapable = pane.snapable || false;

    if (minSize === 0) {
      pane.snapable = false;
    }

    if (index === paneData.length - 1) {
      if (allHaveMaxSizePanes == paneData.length) {
        maxSize = Number.POSITIVE_INFINITY;
      }
    }
    if (pane.snapable) {
      pane.snappedSize = pane.snappedSize || 0;
    }
    if (pane.snapable && pane.snapped === true) {
      size = pane.snappedSize!;
    } else {
      size = pane.minSize;
    }

    pane.minSize = minSize;
    pane.maxSize = maxSize;
    pane.priority = pane.priority || 0;
    pane.size = size;
  });

  const splitViewSize = paneData.reduce(
    (totalSize, pane) => totalSize + pane.size!!,
    0
  );

  let adjustableSizeTotal = containerSize - splitViewSize;

  if (adjustableSizeTotal !== 0) {
    const increaseOrDecrease =
      Math.abs(adjustableSizeTotal) / adjustableSizeTotal;
    const adjustablePanes = paneData.filter(
      (t) =>
        (increaseOrDecrease > 0 && t.size!! < t.maxSize!! && !t.snapped) ||
        (increaseOrDecrease < 0 && t.size!! > t.minSize)
    );
    if (adjustablePanes.length > 0) {
      // group by priority
      const groupByPriority = new Map<number, SplitViewPaneInfo[]>();
      adjustablePanes.sort((a, b) => b.priority!! - a.priority!!);
      adjustablePanes.forEach((t) => {
        let panes = groupByPriority.get(t.priority!!);
        if (!panes) {
          panes = [];
          groupByPriority.set(t.priority!!, panes);
        }
        panes.push(t);
      });

      groupByPriority.forEach((panes) => {
        let groupAdjustableSize = panes.reduce((adjustableSize, pane) => {
          if (increaseOrDecrease > 0) {
            return adjustableSize + (pane.maxSize! - pane.size!);
          }
          return adjustableSize + (pane.size! - pane.minSize);
        }, 0);
        if (groupAdjustableSize === Number.POSITIVE_INFINITY) {
          groupAdjustableSize = adjustableSizeTotal;
        }

        if (Math.abs(adjustableSizeTotal) >= groupAdjustableSize) {
          adjustableSizeTotal -= groupAdjustableSize * increaseOrDecrease;
        } else {
          groupAdjustableSize = adjustableSizeTotal * increaseOrDecrease;
          adjustableSizeTotal = 0;
        }

        let count = panes.length;
        let averageSize = groupAdjustableSize / count;
        panes
          .sort((a, b) =>
            increaseOrDecrease > 0
              ? a.maxSize! - a.size! - (b.maxSize! - b.size!)
              : a.size! - a.minSize! - (b.size! - b.minSize!)
          )
          .forEach((pane) => {
            const thePaneAllowed =
              increaseOrDecrease > 0
                ? pane.maxSize! - pane.size!
                : pane.size! - pane.minSize!;
            if (thePaneAllowed < averageSize) {
              pane.size! += thePaneAllowed * increaseOrDecrease;
              groupAdjustableSize -= thePaneAllowed;
            } else {
              pane.size! += averageSize * increaseOrDecrease;
              groupAdjustableSize -= averageSize;
            }
            count--;
            averageSize = groupAdjustableSize / count;
          });
      });
    } else {
      // ...
    }
  }
};

const resize = (
  panes: SplitViewPaneInfo[],
  adjustSize: number,
  direction: number,
  commiting: boolean
) => {
  let adjustSizeTotal = adjustSize;
  let adjustableSize = 0;
  if (panes[0].snapped && panes[0].size === panes[0].snappedSize) {
    return 0;
  }
  for (let i = 0; i < panes.length && adjustSizeTotal > 0; i++) {
    const pane = panes[i];
    const paneAdjustableSize =
      direction > 0
        ? pane.maxSize! - pane.size!
        : pane.snapable && pane.size == pane.minSize && commiting
        ? pane.minSize
        : pane.size! - pane.minSize;
    if (paneAdjustableSize >= adjustSizeTotal) {
      adjustableSize += adjustSizeTotal;
      if (commiting) {
        pane.size! += adjustSizeTotal * direction;
      }
      adjustSizeTotal = 0;
    } else {
      adjustSizeTotal -= paneAdjustableSize;
      if (commiting) {
        pane.size! += paneAdjustableSize * direction;
      }
      adjustableSize += paneAdjustableSize;
    }
    if (commiting && pane.snapped && pane.size! != pane.snappedSize) {
      pane.snapped = false;
    }
  }
  return adjustableSize;
};

function getSashState(frontPaneData: SplitViewPaneInfo, behandPaneData: SplitViewPaneInfo) {
  let state = SplitViewSashState.Enabled;
  if (
    frontPaneData.minSize == frontPaneData.maxSize ||
    behandPaneData.minSize == behandPaneData.maxSize
  ) {
    state = SplitViewSashState.Disabled;
  } else if (frontPaneData.minSize == frontPaneData.size) {
    state = SplitViewSashState.Minimum;
  } else if (frontPaneData.maxSize == frontPaneData.size) {
    state = SplitViewSashState.Maximum;
  }
  return state;
}

function getChildrenMap(children: ReactNode) {
  const map = new Map<string, ReactElement<any>>();
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.props.paneKey) {
      map.set(child.props.paneKey, child);
    }
  });
  return map;
}

export function SplitView({
  //viewName,
  paneData,
  onChange,
  layout = "horizontal",
  children,
  hoverDelay = DEFAULT_HOVER_DELAY,
  sashSize = DEFAULT_SASH_SIZE,
  actionRef,
}: SplitViewProps) {
  const [paneDataState, setPaneDataState] = useState<SplitViewPaneInfo[]>(paneData.map(paneInfo => ({ ...paneInfo })));
  const [containerSize, setContainerSize] = useState(0);
  const containerSizeRef = useRef(0);
  const initedRef = useRef(false);
  const updatedRef = useRef(false);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;
  containerSizeRef.current = containerSize;

  //console.log("containerSize:", containerSize);

  useEffect(() => {
    if (containerSize > 0) {
      initedRef.current = true;
      //console.log("containerSize:", containerSize);
      setPaneDataState((prevPaneData) => {
        const data = prevPaneData.map((t) => ({ ...t }));
        relayout(containerSize, data);
        //console.log("data:", data);
        return data;
      });
    }
  }, [containerSize]);

  const updatePaneData = useCallback(() => {
    setPaneDataState((prevPaneData) => {
      if (containerSizeRef.current > 0) {
        const paneDataCloned = paneData.map((t) => ({ ...t }));
        relayout(containerSizeRef.current, paneDataCloned);
        return [...paneDataCloned];
      }
      return prevPaneData;
    });
  }, [paneData]);

  useEffect(() => {
    if (!updatedRef.current && containerSize > 0) {
      //console.log("updated");
      updatedRef.current = true;
      updatePaneData();
    }
  }, [updatePaneData, containerSize]);

  useEffect(() => {
    if (actionRef) {
      actionRef.current = { updatePaneData };
    }
  }, [actionRef, updatePaneData]);
  // useEffect(() => {}, [paneData]);

  const sumRef = useRef(0);

  const onSashDragStopedCallback = useCallback(() => {
    sumRef.current = 0;
  }, []);

  const onSashDragingCallback = useCallback(
    (delta: number, index: number) => {
      if (delta !== 0) {
        const adjustSize = Math.abs(delta);
        const frontPanes = paneDataState.slice(0, index).reverse();
        const behandPanes = paneDataState.slice(index, paneDataState.length);

        const increasingPanes = delta > 0 ? frontPanes : behandPanes;
        const decreasingPanes = delta < 0 ? frontPanes : behandPanes;

        let increasableSize = resize(increasingPanes, adjustSize, 1, false);
        let decreasableSize = resize(decreasingPanes, adjustSize, -1, false);
        if (
          increasableSize == 0 &&
          increasingPanes[0].snapable &&
          increasingPanes[0].snapped &&
          increasingPanes[0].minSize != increasingPanes[0].maxSize
        ) {
          const fixedPaneCount = increasingPanes.reduce((total, pane) => {
            if (pane.minSize === pane.maxSize) {
              return total + 1;
            }
            return total;
          }, 0);
          if (fixedPaneCount === increasingPanes.length - 1) {
            const a =
              increasingPanes[0].minSize - increasingPanes[0].snappedSize!;

            const decreasableSize1 = resize(decreasingPanes, a, -1, false);

            if (decreasableSize1 >= a) {
              sumRef.current += Math.abs(delta);
            }
            if (sumRef.current > DEFAULT_SNAP_THRESHOLD_SIZE) {
              sumRef.current = 0;
              increasableSize = decreasableSize = a;
              increasingPanes[0].snapped = false;
            }
          }
        }

        if (
          decreasableSize == 0 &&
          decreasingPanes.length > 0 &&
          decreasingPanes[0].snapable &&
          !decreasingPanes[0].snapped &&
          decreasingPanes[0].minSize != decreasingPanes[0].maxSize //非固定固定
        ) {
          const fixedPaneCount = decreasingPanes.reduce((total, pane) => {
            if (pane.minSize === pane.maxSize) {
              return total + 1;
            }
            return total;
          }, 0);
          if (fixedPaneCount === decreasingPanes.length - 1) {
            const collapsingPane = decreasingPanes[0];
            if (collapsingPane.snapable) {
              const as = collapsingPane.minSize - collapsingPane.snappedSize!;
              const increasableSize1 = resize(
                increasingPanes,
                collapsingPane.minSize - collapsingPane.snappedSize!,
                1,
                false
              );

              if (increasableSize1 >= as) {
                sumRef.current += Math.abs(delta);
                if (sumRef.current > DEFAULT_SNAP_THRESHOLD_SIZE) {
                  sumRef.current = 0;
                  increasableSize = decreasableSize =
                    collapsingPane.minSize - collapsingPane.snappedSize!;
                  collapsingPane.snapped = true;
                }
              }
            }
          }
        }
        const commitAdjustSize = Math.min(increasableSize, decreasableSize);

        resize(increasingPanes, commitAdjustSize, 1, true);
        resize(decreasingPanes, commitAdjustSize, -1, true);

        setPaneDataState([...paneDataState]);
      }
    },
    [paneDataState]
  );

  const paneAndSash = useMemo(() => {
    let currentPosition = 0;
    const paneKeys: string[] = [];
    const sashes: ReactNode[] = [];
    const paneMap = new Map<string, PaneData>();

    paneDataState.forEach((paneInfo, i) => {
      const position = currentPosition;
      currentPosition += paneInfo.size!;
      const paneDataWithPosition: PaneData = { ...paneInfo, position };
      paneKeys.push(paneInfo.paneKey);
      paneMap.set(paneInfo.paneKey, paneDataWithPosition);
      if (i > 0) {
        const state = getSashState(paneDataState[i - 1], paneDataState[i]);

        sashes.push(
          <SplitViewSash
            index={i}
            key={`__svs_${paneInfo.paneKey}`}
            onSashDraging={onSashDragingCallback}
            onSashDragStoped={onSashDragStopedCallback}
            position={position}
            layout={layout}
            delay={hoverDelay}
            sashState={state}
            size={sashSize}
          />
        );
      }
    });

    return {
      paneKeys,
      sashes,
      paneMap,
    };
  }, [
    hoverDelay,
    layout,
    onSashDragingCallback,
    onSashDragStopedCallback,
    paneDataState,
    sashSize,
  ]);

  const childMap = useMemo(() => getChildrenMap(children), [children]);

  useEffect(() => {
    if (
      paneDataState.length != paneData.length ||
      paneData.some((pane1, index) => {
        const pane2 = paneDataState[index];
        return pane2 && pane1 && !isPaneEquals(pane1, pane2);
      })
    ) {
      onChangeRef.current?.(paneDataState);
    }
  }, [paneDataState, paneData]);

  //console.log("render", paneAndSash);
  return (
    <SplitViewProvider value={{ layout, paneMap: paneAndSash.paneMap }}>
      <ResizeObserver
        onResize={({ width, height }) => {
          const containerSize = layout === "horizontal" ? width : height;
          setContainerSize(containerSize);
        }}
      >
        <div className="split-view">
          {initedRef.current && (
            <>
              <div
                className="split-view-sash-container"
              >
                {paneAndSash.sashes}
              </div>
              <div
                className="split-view-pane-contaienr"
              >
                {paneAndSash.paneKeys.map(key => childMap.get(key))}
              </div>
            </>
          )}
        </div>
      </ResizeObserver>
    </SplitViewProvider>
  );
}
