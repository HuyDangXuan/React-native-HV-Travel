import React from "react";
import IconButton from "./ui/IconButton";

interface BackButtonProps {
  onPress: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  return <IconButton icon="arrow-back" onPress={onPress} />;
}
