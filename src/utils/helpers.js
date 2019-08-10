export function debounce(func, wait, immediate) {
  var timeout;
  return function executedFunction() {
    var context = this;
    var args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export const openFileSchema = (
  filename = '',
  code = '',
  initialState = code,
  isForeign = false,
  foreignPath = ''
) => ({
  filename,
  code,
  initialState,
  isForeign,
  foreignPath
});