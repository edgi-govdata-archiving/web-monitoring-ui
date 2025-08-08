# File Preview Feature Implementation

## Summary

This implementation addresses GitHub issue #1067 by adding better handling for non-renderable content in the web monitoring UI. Instead of trying to display raw content that may cause download prompts or blank spaces, the system now shows informative file previews for content that cannot be rendered inline.

## Changes Made

### New Components

1. **`FilePreview` Component** (`src/components/file-preview.jsx`)
   - Displays file information including name, media type, size, hash, and capture time
   - Provides "View Raw File" and "Download File" buttons
   - Shows clear messaging about why the file cannot be rendered inline

2. **`SideBySideFilePreview` Component** (`src/components/side-by-side-file-preview.jsx`)
   - Displays two file previews side-by-side for version comparisons
   - Consistent with existing side-by-side layout patterns

3. **File Preview Styles** (`src/components/file-preview.css`)
   - Clean, responsive styling for file preview components
   - Warning messages and action buttons properly styled
   - Mobile-friendly responsive design

### Enhanced Diff Types

4. **New Diff Types** (in `src/constants/diff-types.js`)
   - `FILE_PREVIEW`: Single file preview
   - `SIDE_BY_SIDE_FILE_PREVIEW`: Side-by-side file preview
   - Updated `diffTypesFor()` function to automatically detect non-renderable content

5. **Smart Content Detection**
   - Added `isNonRenderableType()` function to identify content that should use file preview
   - Maintains existing behavior for renderable content (HTML, text, images, PDFs, etc.)
   - Defaults to file preview for Office documents, archives, and other binary formats

### Integration Updates

6. **`DiffView` Component Updates** (`src/components/diff-view.jsx`)
   - Added support for rendering new file preview diff types
   - Imports and handles new components

7. **`ChangeView` Component Updates** (`src/components/change-view/change-view.jsx`)
   - Smart default diff type selection based on content type
   - Non-renderable content defaults to `SIDE_BY_SIDE_FILE_PREVIEW`
   - Renderable content maintains existing defaults

## File Types Handled

### Non-Renderable (uses File Preview):
- Microsoft Office documents (.xlsx, .docx, .ppt, etc.)
- Archive files (.zip, .tar.gz, etc.)
- Binary executables and data files
- Specialized formats without browser support

### Renderable (uses existing views):
- HTML content
- Plain text and code files
- PDFs (browser-native support)
- Images (PNG, JPEG, GIF, SVG, etc.)
- Audio/video files
- JSON and XML

## User Experience

- When viewing non-renderable content, users see a clean information card instead of download prompts
- Clear file metadata including type, size, and hash
- Easy access to raw file content via "View Raw File" button
- Download option with proper filename
- Consistent side-by-side layout for comparisons
- Informative messaging explaining why inline rendering isn't available

## Testing

- Added comprehensive test coverage for new components
- Tests verify proper file information display
- Tests confirm appropriate diff type selection based on content type
- All existing tests continue to pass

## Backward Compatibility

- Existing functionality for renderable content is unchanged
- Raw view options remain available as fallback
- No breaking changes to existing APIs or user workflows

## Future Enhancements

This foundation could be extended to support:
- Specialized viewers for specific file types
- File size information from server metadata
- Thumbnail generation for supported formats
- More detailed file analysis and comparison
