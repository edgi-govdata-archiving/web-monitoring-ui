import { Tooltip } from 'react-tooltip';
import styles from './standard-tooltip.css';

export default function StandardTooltip (props) {
  return <Tooltip
    place="top"
    className={styles.standardTooltip}
    {...props}
  />;
}
