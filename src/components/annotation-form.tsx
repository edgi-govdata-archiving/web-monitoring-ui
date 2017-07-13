/* tslint:disable:max-line-length */
import * as React from 'react';
// Using this component I found: https://github.com/mcumpl/react-lightweight-tooltip
import {Tooltip} from 'react-lightweight-tooltip';
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

        const classes = ['annotation-form'];
        if (this.props.collapsed) {
            classes.push('annotation-form--collapsed');
        }

        // Have to create empty objects because Typescript is a harlot
        const tooltipStyles = {
            arrow: {
                borderTop: 'solid #444 5px'
            },
            content: {
                background: '#444'
            },
            gap: {},
            tooltip: {
                background: '#444',
                borderRadius: 3
            },
            wrapper: {
                cursor: 'default',
                display: 'block'
            }
        };

        return (
            <div className="annotation-inputs">
                <form className={classes.join(' ')}>
                    <div className="signifier-container">
                        <h5>Individual Page Changes</h5>
                        <ul className="signifier-list">
                            <Tooltip content="Date and time change only" styles={tooltipStyles}>
                                <Checkbox {...common} name="indiv_1">Date and time change only</Checkbox>
                            </Tooltip>
                            <Tooltip content="Text or numeric content removal or change" styles={tooltipStyles}>
                                <Checkbox {...common} name="indiv_2">Text or numeric content removal or change</Checkbox>
                            </Tooltip>
                            <Tooltip content="Image content removal or change" styles={tooltipStyles}>
                                <Checkbox {...common} name="indiv_3">Image content removal or change</Checkbox>
                            </Tooltip>
                            <Tooltip content="Hyperlink removal or change" styles={tooltipStyles}>
                                <Checkbox {...common} name="indiv_4">Hyperlink removal or change</Checkbox>
                            </Tooltip>
                            <Tooltip content="Text-box, entry field, or interactive component removal or change" styles={tooltipStyles}>
                                <Checkbox {...common} name="indiv_5">Text-box, entry field, or interactive component removal or change</Checkbox>
                            </Tooltip>
                            <Tooltip content="Page removal (whether it has happened in the past or is currently removed)" styles={tooltipStyles}>
                                <Checkbox {...common} name="indiv_6">Page removal (whether it has happened in the past or is currently removed)</Checkbox>
                            </Tooltip>
                        </ul>
                    </div>
                    <div className="signifier-container">
                        <h5>Repeated Changes</h5>
                        <ul className="signifier-list">
                            <Tooltip content="Header menu removal or change" styles={tooltipStyles}>
                                <Checkbox {...common} name="repeat_7">Header menu removal or change</Checkbox>
                            </Tooltip>
                            <Tooltip content="Template text, page format, or comment field removal or change" styles={tooltipStyles}>
                                <Checkbox {...common} name="repeat_8">Template text, page format, or comment field removal or change</Checkbox>
                            </Tooltip>
                            <Tooltip content="Footer or site map removal or change" styles={tooltipStyles}>
                                <Checkbox {...common} name="repeat_9">Footer or site map removal or change</Checkbox>
                            </Tooltip>
                            <Tooltip content="Sidebar removal or change" styles={tooltipStyles}>
                                <Checkbox {...common} name="repeat_10">Sidebar removal or change</Checkbox>
                            </Tooltip>
                            <Tooltip content="Banner/advertisement removal or change" styles={tooltipStyles}>
                                <Checkbox {...common} name="repeat_11">Banner/advertisement removal or change</Checkbox>
                            </Tooltip>
                            <Tooltip content="Scrolling news/reports" styles={tooltipStyles}>
                                <Checkbox {...common} name="repeat_12">Scrolling news/reports</Checkbox>
                            </Tooltip>
                        </ul>
                    </div>
                    <div className="signifier-container">
                        <h5>Significance</h5>
                        <ul className="signifier-list">
                            <Tooltip content="Change related to energy, environment, or climate" styles={tooltipStyles}>
                                <Checkbox {...common} name="sig_1">Change related to energy, environment, or climate</Checkbox>
                            </Tooltip>
                            <Tooltip content="Language is significantly altered" styles={tooltipStyles}>
                                <Checkbox {...common} name="sig_2">Language is significantly altered</Checkbox>
                            </Tooltip>
                            <Tooltip content="Content is removed" styles={tooltipStyles}>
                                <Checkbox {...common} name="sig_3">Content is removed</Checkbox>
                            </Tooltip>
                            <Tooltip content="Page is removed" styles={tooltipStyles}>
                                <Checkbox {...common} name="sig_4">Page is removed</Checkbox>
                            </Tooltip>
                            <Tooltip content="Insignificant" styles={tooltipStyles}>
                                <Checkbox {...common} name="sig_5">Insignificant</Checkbox>
                            </Tooltip>
                            <Tooltip content="Repeated Insignificant" styles={tooltipStyles}>
                                <Checkbox {...common} name="sig_6">Repeated Insignificant</Checkbox>
                            </Tooltip>
                        </ul>
                    </div>
                </form>
            </div>
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
            <input type="checkbox" className="toggle" id={name} checked={checked} onChange={changeHandler}/>
            <label className="toggle-btn" data-tg-on={fieldNumber} htmlFor={name} />
            <span className="info-text">{children}</span>
        </li>
    );
}
