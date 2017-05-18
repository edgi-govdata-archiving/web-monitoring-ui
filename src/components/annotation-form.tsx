/* tslint:disable:max-line-length */
import * as React from 'react';

export interface IAnnotationFormProps {
    version: any;
}

export default ({version}: IAnnotationFormProps) => (
    <form className="row short-view">
        <div className="col-md-4">
            <h4>Individual Page Changes</h4>
            <Checkbox field="indiv_1">Date and time change only</Checkbox>
            <Checkbox field="indiv_2">Text or numeric content removal or change</Checkbox>
            <Checkbox field="indiv_3">Image content removal or change</Checkbox>
            <Checkbox field="indiv_4">Hyperlink removal or change</Checkbox>
            <Checkbox field="indiv_5">Text-box, entry field, or interactive component removal or change</Checkbox>
            <Checkbox field="indiv_6">Page removal (whether it has happened in the past or is currently removed)</Checkbox>
        </div>
        <div className="col-md-4">
            <h4>Repeated Changes</h4>
            <Checkbox field="repeat7">Header menu removal or change</Checkbox>
            <Checkbox field="repeat8">Template text, page format, or comment field removal or change</Checkbox>
            <Checkbox field="repeat9">Footer or site map removal or change</Checkbox>
            <Checkbox field="repeat10">Sidebar removal or change</Checkbox>
            <Checkbox field="repeat11">Banner/advertisement removal or change</Checkbox>
            <Checkbox field="repeat12">Scrolling news/reports</Checkbox>
        </div>
        <div className="col-md-4">
            <h4>Significance</h4>
            <Checkbox field="sig_1">Change related to energy, environment, or climate</Checkbox>
            <Checkbox field="sig_2">Language is significantly altered</Checkbox>
            <Checkbox field="sig_3">Content is removed</Checkbox>
            <Checkbox field="sig_4">Page is removed</Checkbox>
            <Checkbox field="sig_5">Insignificant</Checkbox>
            <Checkbox field="sig_6">Repeated Insignificant</Checkbox>
        </div>
    </form>
);

function Checkbox (props: {field: string, children?: any}) {
    const fieldNumber = props.field.split('_')[1];

    return (
        <label>
            <input type="checkbox" name={`cbox_${props.field}`} />
            {fieldNumber}
            <span className="info-text">= {props.children}</span>
        </label>
    );
}
