export function isMouseOverCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}