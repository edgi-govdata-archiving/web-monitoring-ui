import { Tooltip } from 'react-tooltip';
import styles from './standard-tooltip.css'; // eslint-disable-line

export default function StandardTooltip (props) {
  return <Tooltip
    place="top"
    styleName="styles.standard-tooltip"
    {...props}
  />;
}
