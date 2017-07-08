import * as React from 'react';


// DiffItem displays a diff delete/add/unchanged element
export default class DiffItem extends React.Component<any,any> {
  render() {
    const { data, onSelect } = this.props;
    const diff = data;
    
    // here we do inline style-editing and class switching.
    // in the real world it's probably a good idea to associate
    // styles with the class and remove the "styles" object entirely.
    let styles:any = {};
    let diffTypeClass:string = "unchanged";
    
    // this data comes from https://github.com/edgi-govdata-archiving/go-calc-diff
    // it may be necessary to adjust the "data.Type" inspections based on differ
    if (diff.Type == -1) {
      diffTypeClass = "removed"
      styles.background = "red";
    } else if (diff.Type == 1) {
      diffTypeClass = "added"
      styles.background = "green";
    }

    return (
      <span 
        className={`diff item ${diffTypeClass}`}
        style={styles}
        onClick={onSelect}>{diff.Text}</span>
    );
  }
}

// DiffItem.propTypes = {
//   data: React.PropTypes.object.isRequired,
//   onSelect: React.PropTypes.func,
// };

// DiffItem.defaultProps = {
// };

