/* tslint:disable:max-line-length */
import * as React from 'react';
import {Version} from '../services/web-monitoring-db';

export interface IAnnotationFormProps {
    annotation: any;
    collapsed?: boolean;
    onChange?: (annotation: any) => void;
}

export default class AnnotationForm extends React.Component<IAnnotationFormProps, null> {
    static defaultProps: IAnnotationFormProps = {
        annotation: null,
        collapsed: true
    };

    constructor (props: IAnnotationFormProps) {
        super(props);
        this.onFieldChange = this.onFieldChange.bind(this);
    }

    render () {
        const common = {
            formValues: this.props.annotation,
            onChange: this.onFieldChange
        };

        const classes = ['row', 'annotation-form'];
        if (this.props.collapsed) {
            classes.push('annotation-form--collapsed');
        }

        return (
            <form className={classes.join(' ')}>
                <div className="col-md-4">
                    <h5>Individual Page Changes</h5>
                    <ul className="signifier-list">
                        <Checkbox {...common} name="indiv_1">Date and time change only</Checkbox>
                        <Checkbox {...common} name="indiv_2">Text or numeric content removal or change</Checkbox>
                        <Checkbox {...common} name="indiv_3">Image content removal or change</Checkbox>
                        <Checkbox {...common} name="indiv_4">Hyperlink removal or change</Checkbox>
                        <Checkbox {...common} name="indiv_5">Text-box, entry field, or interactive component removal or change</Checkbox>
                        <Checkbox {...common} name="indiv_6">Page removal (whether it has happened in the past or is currently removed)</Checkbox>
                    </ul>
                </div>
                <div className="col-md-4">
                    <h5>Repeated Changes</h5>
                    <ul className="signifier-list">
                        <Checkbox {...common} name="repeat_7">Header menu removal or change</Checkbox>
                        <Checkbox {...common} name="repeat_8">Template text, page format, or comment field removal or change</Checkbox>
                        <Checkbox {...common} name="repeat_9">Footer or site map removal or change</Checkbox>
                        <Checkbox {...common} name="repeat_10">Sidebar removal or change</Checkbox>
                        <Checkbox {...common} name="repeat_11">Banner/advertisement removal or change</Checkbox>
                        <Checkbox {...common} name="repeat_12">Scrolling news/reports</Checkbox>
                    </ul>
                </div>
                <div className="col-md-4">
                    <h5>Significance</h5>
                    <ul className="signifier-list">
                        <Checkbox {...common} name="sig_1">Change related to energy, environment, or climate</Checkbox>
                        <Checkbox {...common} name="sig_2">Language is significantly altered</Checkbox>
                        <Checkbox {...common} name="sig_3">Content is removed</Checkbox>
                        <Checkbox {...common} name="sig_4">Page is removed</Checkbox>
                        <Checkbox {...common} name="sig_5">Insignificant</Checkbox>
                        <Checkbox {...common} name="sig_6">Repeated Insignificant</Checkbox>
                    </ul>
                </div>
            </form>
        );
    }

    private onFieldChange (valueObject: any) {
        if (this.props.onChange) {
            const newAnnotation = Object.assign({}, this.props.annotation, valueObject);
            this.props.onChange(newAnnotation);
        }
    }
}

interface ICheckboxProps {
    children?: React.ReactNode;
    formValues: any;
    name: string;
    onChange: (valueObject: any) => void;
}

function Checkbox ({children, formValues, name, onChange}: ICheckboxProps) {
    const fieldNumber = name.split('_')[1];
    const checked = !!(formValues && formValues[name]);
    const changeHandler = (event: React.FormEvent<HTMLInputElement>) =>
        onChange({[name]: event.currentTarget.checked});
    return (
        <li className="signifier-list-item">
            <input type="checkbox" className="tgl tgl-skewed" id={name} checked={checked} onChange={changeHandler}/>
            <label className="tgl-btn" data-tg-on={fieldNumber} htmlFor={name} />
            <span className="info-text">= {children}</span>
        </li>
//         <label>
// -            <input type="checkbox" name={name} checked={checked} onChange={changeHandler} />
// -            {fieldNumber}
// -            <span className="info-text">= {children}</span>
// -        </label>
    );
}
