let defaultColor = 'white',
  activeColor = 'greenyellow',
  fillColor = 'transparent';

let labelToolColors = {
  'Tumor type 1': 'DarkGoldenRod',
  'Tumor type 2': 'coral',
  'Tumor type 3': 'DarkSlateBlue',
  'Tumor type 4': 'DeepSkyBlue',
  'Tumor type 5': 'Moccasin',
};

function setFillColor(color) {
  fillColor = color;
}

function getFillColor() {
  return fillColor;
}

function setToolColor(color) {
  defaultColor = color;
}

function getToolColorWithLabel(label) {
  if (labelToolColors[label]) {
    return labelToolColors[label];
  }
}

function getToolColor(label) {
  return defaultColor;
}

function setActiveColor(color) {
  activeColor = color;
}

function getActiveColor() {
  return activeColor;
}

function getColorIfActive(data) {
  if (data.color) {
    return data.color;
  }

  return data.active ? activeColor : defaultColor;
}

const toolColors = {
  setFillColor,
  getFillColor,
  setToolColor,
  getToolColorWithLabel,
  getToolColor,
  setActiveColor,
  getActiveColor,
  getColorIfActive,
};

export default toolColors;
