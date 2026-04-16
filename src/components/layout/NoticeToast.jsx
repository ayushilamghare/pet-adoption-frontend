import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearNotice, selectNotice } from "../../features/ui/uiSlice";

export function NoticeToast() {
  const dispatch = useDispatch();
  const notice = useSelector(selectNotice);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => dispatch(clearNotice()), 3600);
    return () => window.clearTimeout(timeout);
  }, [dispatch, notice]);

  if (!notice) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-soft">
      {notice}
    </div>
  );
}
