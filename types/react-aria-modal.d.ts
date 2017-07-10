// Type definitions for react-aria-modal

declare module "react-aria-modal" {
    export = AriaModal;

    class AriaModal extends React.Component<AriaModal.AriaModalProps, undefined> {
        constructor(someParam?: string);
    }

    namespace AriaModal {
        interface AriaModalProps {
            onExit: () => void;
            applicationNode?: Node;
            getApplicationNode?: () => Node;
            alert?: boolean;
            includeDefaultStyles?: boolean;
            dialogClass?: string;
            dialogId?: string;
            dialogStyle?: any;
            focusDialog?: boolean;
            initialFocus?: string;
            mounted?: boolean;
            onEnter?: () => void;
            titleId?: string;
            titleText?: string;
            underlayStyle?: any;
            underlayClass?: string;
            underlayClickExits?: boolean;
            escapeExits?: boolean;
            underlayColor?: string|boolean;
            verticallyCenter?: boolean;
            focusTrapPaused?: boolean;
        }
    }
}
