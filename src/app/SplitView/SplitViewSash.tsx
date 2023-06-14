import {
  useCallback,
  useEffect,
  useRef,
  useState,
  CSSProperties,
  MouseEvent as RMouseEvent
} from "react";
import clsx from 'clsx';

import { DEFAULT_SASH_SIZE, DEFAULT_SNAP_THRESHOLD_SIZE } from "./constants";
import { useSplitView } from "./context";
import { SplitViewSashProps, SplitViewSashState } from "./types";

export function SplitViewSash({
  index,
  position = 0,
  onSashDraging,
  onSashDragStoped,
  sashState = SplitViewSashState.Maximum,
  size = DEFAULT_SASH_SIZE,
  delay = DEFAULT_SNAP_THRESHOLD_SIZE,
}: SplitViewSashProps) {
  const onSashDragingRef = useRef(onSashDraging);
  onSashDragingRef.current = onSashDraging;
  const onSashDragStopedRef = useRef(onSashDragStoped);
  onSashDragStopedRef.current = onSashDragStoped;
  const mousePositionRef = useRef<number>(0);
  const mouseDownRef = useRef<boolean>(false);
  const [state, setState] = useState({ mouseEnter: false, hover: false });
  const { layout } = useSplitView();

  useEffect(() => {
    const documentMouseMoveListener = (e: MouseEvent) => {
      if (mouseDownRef.current) {
        e.preventDefault();
        const mousePosition = layout === "horizontal" ? e.screenX : e.screenY;
        const delta = mousePosition - mousePositionRef.current;
        mousePositionRef.current = mousePosition;
        onSashDragingRef.current?.(delta, index);
      }
    };
    const documentMouseUpListener = (e: MouseEvent) => {
      if (mouseDownRef.current) {
        e.preventDefault();
        mouseDownRef.current = false;
        setState((prev) => ({ ...prev, hover: false, mouseEnter: false }));
        onSashDragStopedRef.current?.();
      }
    };

    window.addEventListener("mousemove", documentMouseMoveListener);
    window.addEventListener("mouseup", documentMouseUpListener);

    return () => {
      window.removeEventListener("mousemove", documentMouseMoveListener);
      window.removeEventListener("mouseup", documentMouseUpListener);
    };
  }, [index, layout]);

  const style: CSSProperties = {};
  const classNames: string[] = [];
  const center = position - size / 2;
  if (layout == "horizontal") {
    style.width = size;
    style.left = `${center}px`;
    classNames.push("horizontal");
    if (sashState === SplitViewSashState.Minimum) {
      classNames.push("minimum");
    } else if (sashState === SplitViewSashState.Maximum) {
      classNames.push("maximum");
    } else if (sashState == SplitViewSashState.Enabled) {
      classNames.push("enabled");
    }
  } else {
    style.height = size;
    style.top = `${center}px`;
    classNames.push("vertical");
    if (sashState === SplitViewSashState.Minimum) {
      classNames.push("minimum");
    } else if (sashState === SplitViewSashState.Maximum) {
      classNames.push("maximum");
    } else if (sashState == SplitViewSashState.Enabled) {
      classNames.push("enabled");
    }
  }
  if (state.hover || mouseDownRef.current) {
    classNames.push("hover");
  }
  if (sashState === SplitViewSashState.Disabled) {
    classNames.push("disabled");
  }

  // Delay hover
  useEffect(() => {
    let timerId: any = undefined;
    if (state.mouseEnter) {
      timerId = setTimeout(() => {
        setState((pre) => ({ ...pre, hover: true }));
      }, delay);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [state.mouseEnter, delay]);

  const onMouseDownCallback = useCallback(
    (e: RMouseEvent) => {
      if (sashState != SplitViewSashState.Disabled) {
        mousePositionRef.current =
          layout === "horizontal" ? e.screenX : e.screenY;
        mouseDownRef.current = true;
        setState((pre) => ({ ...pre, mouseEnter: true, hover: true }));
      }
    },
    [layout, sashState]
  );

  const onMouseEnter = useCallback(() => {
    if (!mouseDownRef.current && sashState != SplitViewSashState.Disabled) {
      setState((pre) => ({ ...pre, mouseEnter: true }));
    }
  }, [sashState]);

  const onMouseLeave = useCallback(() => {
    if (!mouseDownRef.current) {
      setState((pre) => ({ ...pre, mouseEnter: false, hover: false }));
    }
  }, []);

  return (
    <div
      className={clsx('split-view-sash', ...classNames)}
      style={style}
      onMouseDown={onMouseDownCallback}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    ></div>
  );
}
