import * as React from 'react';

export interface AnnotationFormProps {
    version: any
}

export default ({version}: AnnotationFormProps) => (
    <div className="row short-view">
        <form>
        <div className="col-md-4">
            <h4>Individual Page Changes</h4>
            <label><input type="checkbox" name="cbox_indiv_1" />1 <span className="info-text">= Date and time change only</span></label>
            <label><input type="checkbox" name="cbox_indiv_2" />2 <span className="info-text">= Text or numeric content removal or change</span></label>
            <label><input type="checkbox" name="cbox_indiv_3" />3 <span className="info-text">= Image content removal or change</span></label>
            <label><input type="checkbox" name="cbox_indiv_4" />4 <span className="info-text">= Hyperlink removal or change</span></label>
            <label><input type="checkbox" name="cbox_indiv_5" />5 <span className="info-text">= Text-box, entry field, or interactive component removal or change</span></label>
            <label><input type="checkbox" name="cbox_indiv_6" />6 <span className="info-text">= Page removal (whether it has happened in the past or is currently removed)</span></label>
        </div>
        <div className="col-md-4">
            <h4>Repeated Changes</h4>
            <label><input type="checkbox" name="cbox_repeat_7" />7 <span className="info-text">= Header menu removal or change</span></label>
            <label><input type="checkbox" name="cbox_repeat_8" />8 <span className="info-text">= Template text, page format, or comment field removal or change</span></label>
            <label><input type="checkbox" name="cbox_repeat_9" />9 <span className="info-text">= Footer or site map removal or change</span></label>
            <label><input type="checkbox" name="cbox_repeat_10" />10 <span className="info-text">= Sidebar removal or change</span></label>
            <label><input type="checkbox" name="cbox_repeat_11" />11 <span className="info-text">= Banner/advertisement removal or change</span></label>
            <label><input type="checkbox" name="cbox_repeat_12" />12 <span className="info-text">= Scrolling news/reports</span></label>
        </div>
        <div className="col-md-4">
            <h4>Significance</h4>
            <label><input type="checkbox" name="cbox_sig_1" />1 <span className="info-text">= Change related to energy, environment, or climate</span></label>
            <label><input type="checkbox" name="cbox_sig_2" />2 <span className="info-text">= Language is significantly altered</span></label>
            <label><input type="checkbox" name="cbox_sig_3" />3 <span className="info-text">= Content is removed</span></label>
            <label><input type="checkbox" name="cbox_sig_4" />4 <span className="info-text">= Page is removed</span></label>
            <label><input type="checkbox" name="cbox_sig_5" />5 <span className="info-text">= Insignificant</span></label>
            <label><input type="checkbox" name="cbox_sig_6" />6 <span className="info-text">= Repeated Insignificant</span></label>
        </div>
        </form>
    </div>
);
