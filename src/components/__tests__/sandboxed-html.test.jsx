import { render } from '@testing-library/react';
import SandboxedHtml from '../sandboxed-html';

describe('sandboxed-html', () => {
  it('renders an iframe with a sandbox attribute', () => {
    const { container } = render(<SandboxedHtml />);
    const frame = container.querySelector('iframe');
    expect(frame).toHaveAttribute('sandbox');
  });

  it('sets a <base> element for `baseUrl`', () => {
    const source = `<!doctype html>
      <html>
        <head><title>Whatever</title></head>
        <body>Hello!</body>
      </html>`;

    const { container } = render(<SandboxedHtml baseUrl="http://example.com" html={source} />);
    const frame = container.querySelector('iframe');
    expect(frame.srcdoc).toMatch(/<base\s+href="http:\/\/example\.com"/ig);
  });

  it('transforms the html with the `transform` prop', () => {
    const source = `<!doctype html>
      <html>
        <head><title>Whatever</title></head>
        <body>Hello!</body>
      </html>`;

    const transform = document => {
      document.body.appendChild(document.createTextNode('Transformed!'));
      return document;
    };

    const { container } = render(<SandboxedHtml html={source} transform={transform} />);
    const frame = container.querySelector('iframe');
    expect(frame.srcdoc).toMatch(/<body>Hello![\n\s]*Transformed!/ig);
  });
});
