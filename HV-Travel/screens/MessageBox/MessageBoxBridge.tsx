import { useEffect } from "react";
import { useMessageBox } from "./MessageBoxContext";
import { MessageBoxService } from "./MessageBoxService";

export default function MessageBoxBridge() {
  const { show } = useMessageBox();

  useEffect(() => {
    MessageBoxService.register(show);
  }, []);

  return null;
}
