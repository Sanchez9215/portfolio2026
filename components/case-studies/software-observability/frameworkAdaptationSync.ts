// Shared event names for the two-way layout dependency between
// DataDictionaryScene's fan-drop-line and FrameworkAdaptationEyes' hub:
// the line's end-point reads the hub's real top edge, and the hub's x
// reads the line's real position — each fires its own event once its
// own measurement actually changes, so the other side re-measures in
// response instead of guessing how many animation frames to wait.
export const FAN_DROP_LINE_UPDATED = "sos:fan-drop-line-updated";
export const EYES_HUB_UPDATED = "sos:eyes-hub-updated";
