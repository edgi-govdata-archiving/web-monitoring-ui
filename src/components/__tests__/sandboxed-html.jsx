/* eslint-env jest */

import React from 'react';
import {shallow, mount} from 'enzyme';
import SandboxedHtml from '../sandboxed-html';

describe('sandboxed-html', () => {
  it('renders an iframe with a sandbox attribute', () => {
    const sandbox = shallow(<SandboxedHtml />);
    const frame = sandbox.find('iframe').first();
    expect(frame).toBeDefined();
    expect(frame.props().sandbox).toBeTruthy();
  });

  it('sets a <base> element for `baseUrl`', () => {
    const source = `<!doctype html>
      <html>
        <head><title>Whatever</title></head>
        <body>Hello!</body>
      </html>`;

    const sandbox = mount(<SandboxedHtml baseUrl="http://example.com" html={source} />);
    const frame = sandbox.find('iframe').first().getDOMNode();
    expect(frame.getAttribute('srcdoc')).toMatch(/<base\s+href="http:\/\/example\.com"/ig);
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

    const sandbox = mount(<SandboxedHtml html={source} transform={transform} />);
    const frame = sandbox.find('iframe').first().getDOMNode();
    expect(frame.getAttribute('srcdoc')).toMatch(/<body>Hello![\n\s]*Transformed!/ig);
  });
});
