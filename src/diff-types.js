export const diffTypes = {
  FILE_PREVIEW: 'FILE_PREVIEW',
  SIDE_BY_SIDE_FILE_PREVIEW: 'SIDE_BY_SIDE_FILE_PREVIEW'
};

// Map file types to diff types
export const diffTypeMapping = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': diffTypes.FILE_PREVIEW,
  'application/vnd.ms-excel': diffTypes.FILE_PREVIEW,
  'application/x-msexcel': diffTypes.FILE_PREVIEW,
  'application/zip': diffTypes.FILE_PREVIEW,
  'application/x-zip-compressed': diffTypes.FILE_PREVIEW,
  // Add other binary file types here
}; 