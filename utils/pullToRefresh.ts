export const shouldTriggerOverlayRefresh = ({
  minOffsetY,
  threshold = 72,
  isBusy,
}: {
  minOffsetY: number;
  threshold?: number;
  isBusy: boolean;
}) => {
  if (isBusy) return false;
  return Math.abs(Math.min(minOffsetY, 0)) >= threshold;
};
