import * as React from 'react';
import {Version} from '../services/web-monitoring-db';
import {diffTypes} from '../constants/DiffTypes';

import List from './list';
import DiffItem from './diff-item';

export interface IDiffViewProps {
  pageId: string;
  diffType:string;
  a: Version;
  b: Version;
}

// DiffView encapsulates fetching diffs, and wraps all different kinds of diff view types
export default class DiffView extends React.Component<IDiffViewProps,any> {
  constructor(props: IDiffViewProps) {
    super(props);
    this.state = { diff: null }
  }

  componentWillMount() {
    const { props } = this;
    if (this.canFetch(props)){
      this.loadDiff(props.pageId, props.a.uuid, props.b.uuid, props.diffType);
    }
  }

  componentWillReceiveProps(nextProps: IDiffViewProps) {
    if (this.canFetch(nextProps)) {
      this.loadDiff(nextProps.pageId, nextProps.a.uuid, nextProps.b.uuid, nextProps.diffType);
    }
  }

  render() {
    const { a, b, diffType } = this.props;

    if (!a || !b || !diffType || !diffTypes[diffType]) {
      return null;
    }

    console.log(a,b);

    switch (diffTypes[diffType]) {
      case diffTypes.SIDE_BY_SIDE_RENDERED:
        return (
          <div>
             <iframe src={a.uri} />
             <hr />
             <iframe src={b.uri} />
          </div>
        );
       case diffTypes.HIGHLIGHTED_TEXT:
         return (
           <div>
             <List data={fakeData.data} component={DiffItem} />
           </div>
         );
      default:
        return null;
    }
  }

  // check to see if this props object has everything necessary to perform a fetch
  private canFetch(props:IDiffViewProps) {
    return (props.pageId && props.diffType && props.a && props.b && props.a.uuid && props.b.uuid);
  }

  private loadDiff(pageId: string, aId: string, bId: string, diffType: string) {
    // const fromList = this.props.pages && this.props.pages.find(
    //     (page: Page) => page.uuid === pageId);

    // Promise.resolve(fromList || this.context.api.getPage(pageId))
    //     .then((page: Page) => {
    //         this.setState({page});
    //         this.loadLatestVersion(page);
    //     });
  }
}


const fakeData = {
  "data": [
    {
      "Type": -1,
      "Text": "\n"
    },
    {
      "Type": 0,
      "Text": "\n\t\n\n\n\n\n\n\t\n\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\n\t\t\t\t\n\t\t\t\t\tOpen Menu\n\t\t\t\t\n\t\t\t\t\n\t\t\t\t\tClose Menu\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tApple\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tShopping Bag\n\t\t\t\t\t\n\t\t\t\t\n\t\t\t\t\n\t\t\t\n\t\t\n\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tApple\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tMac\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tiPad\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tiPhone\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tWatch\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tTV\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tMusic\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tSupport\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tSearch apple.com\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\tShopping Bag\n\t\t\t\t\t\n\t\t\t\t\n\t\t\t\t\n\t\t\t\n\t\t\n\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\n\t\t\n\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\n\t\t\n\t\n\n\n\n\n\n\n\t\n"
    },
    {
      "Type": -1,
      "Text": "\n\n\n\n\n\n\n"
    },
    {
      "Type": 0,
      "Text": "\t\n\n"
    },
    {
      "Type": -1,
      "Text": "\t"
    },
    {
      "Type": 0,
      "Text": "\n\n"
    },
    {
      "Type": -1,
      "Text": "\t"
    },
    {
      "Type": 0,
      "Text": "\n\n"
    },
    {
      "Type": -1,
      "Text": "\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t"
    },
    {
      "Type": -1,
      "Text": "\t\n\n\t\n\n\n"
    },
    {
      "Type": 0,
      "Text": "\n"
    },
    {
      "Type": -1,
      "Text": "\n\t\t\n\n\t\t\t\n\t\t\t\t\n\t\n\t\t\n\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\n\t\t"
    },
    {
      "Type": 0,
      "Text": "\t\t\n\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\n\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tiP"
    },
    {
      "Type": 1,
      "Text": "The p"
    },
    {
      "Type": 0,
      "Text": "a"
    },
    {
      "Type": -1,
      "Text": "d"
    },
    {
      "Type": 1,
      "Text": "ge"
    },
    {
      "Type": 0,
      "Text": " "
    },
    {
      "Type": -1,
      "Text": "P"
    },
    {
      "Type": 1,
      "Text": "you’"
    },
    {
      "Type": 0,
      "Text": "r"
    },
    {
      "Type": 1,
      "Text": "e l"
    },
    {
      "Type": 0,
      "Text": "o"
    },
    {
      "Type": -1,
      "Text": "\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tAnyth"
    },
    {
      "Type": 1,
      "Text": "ok"
    },
    {
      "Type": 0,
      "Text": "ing "
    },
    {
      "Type": -1,
      "Text": "y"
    },
    {
      "Type": 1,
      "Text": "f"
    },
    {
      "Type": 0,
      "Text": "o"
    },
    {
      "Type": -1,
      "Text": "u"
    },
    {
      "Type": 1,
      "Text": "r"
    },
    {
      "Type": 0,
      "Text": " can"
    },
    {
      "Type": 1,
      "Text": "’t"
    },
    {
      "Type": 0,
      "Text": " "
    },
    {
      "Type": -1,
      "Text": "do,y"
    },
    {
      "Type": 1,
      "Text": "be f"
    },
    {
      "Type": 0,
      "Text": "ou"
    },
    {
      "Type": -1,
      "Text": " ca"
    },
    {
      "Type": 0,
      "Text": "n"
    },
    {
      "Type": -1,
      "Text": " "
    },
    {
      "Type": 0,
      "Text": "d"
    },
    {
      "Type": -1,
      "Text": "o better"
    },
    {
      "Type": 0,
      "Text": ".\n"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\t\t\t\n\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\t\t\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n"
    },
    {
      "Type": -1,
      "Text": "\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\t\t\t\n\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n"
    },
    {
      "Type": -1,
      "Text": "\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\n\t\t\t\n\t\t\t\t\n\t\t\n\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\n\t\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\n\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tiPh"
    },
    {
      "Type": 1,
      "Text": "Or see "
    },
    {
      "Type": 0,
      "Text": "o"
    },
    {
      "Type": -1,
      "Text": "ne"
    },
    {
      "Type": 1,
      "Text": "ur"
    },
    {
      "Type": 0,
      "Text": " "
    },
    {
      "Type": -1,
      "Text": "7\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tThi"
    },
    {
      "Type": 0,
      "Text": "s"
    },
    {
      "Type": -1,
      "Text": " "
    },
    {
      "Type": 0,
      "Text": "i"
    },
    {
      "Type": -1,
      "Text": "s"
    },
    {
      "Type": 1,
      "Text": "te"
    },
    {
      "Type": 0,
      "Text": " "
    },
    {
      "Type": -1,
      "Text": "7.\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 1,
      "Text": "map"
    },
    {
      "Type": 0,
      "Text": "\n\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n"
    },
    {
      "Type": -1,
      "Text": "\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\t\t\n\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\n\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "Apple "
    },
    {
      "Type": -1,
      "Text": "Watch\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tLive a bet"
    },
    {
      "Type": 1,
      "Text": "Foo"
    },
    {
      "Type": 0,
      "Text": "ter"
    },
    {
      "Type": -1,
      "Text": " day."
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\t\t\t\t\n\t\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t"
    },
    {
      "Type": 1,
      "Text": ""
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t"
    },
    {
      "Type": 1,
      "Text": "Apple"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\tiM"
    },
    {
      "Type": 1,
      "Text": "P"
    },
    {
      "Type": 0,
      "Text": "a"
    },
    {
      "Type": -1,
      "Text": "c\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tTh"
    },
    {
      "Type": 1,
      "Text": "g"
    },
    {
      "Type": 0,
      "Text": "e "
    },
    {
      "Type": -1,
      "Text": "visi"
    },
    {
      "Type": 1,
      "Text": "N"
    },
    {
      "Type": 0,
      "Text": "o"
    },
    {
      "Type": -1,
      "Text": "n is brigh"
    },
    {
      "Type": 0,
      "Text": "t"
    },
    {
      "Type": -1,
      "Text": "er than ever.\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tSummer"
    },
    {
      "Type": 0,
      "Text": " Fo"
    },
    {
      "Type": -1,
      "Text": "rmal\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tShop Accessories.\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tS"
    },
    {
      "Type": 0,
      "Text": "u"
    },
    {
      "Type": -1,
      "Text": "mmer Casual\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tShop Accessories."
    },
    {
      "Type": 1,
      "Text": "nd"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\t\t"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t"
    },
    {
      "Type": -1,
      "Text": "\t\t\t\t\t\t\t\n\t\t\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\n\t\t\t\n\t\t\n\t\n\t\t\t\t\n\t\t\t\t\t\n\n\t\t\n\n\n\t\n\t\t\n\t\t\tApple Footer"
    },
    {
      "Type": 0,
      "Text": "\n\t\t\t\n\t\n\t\n\t\t\n\t\t\t\n\t\tShop and Learn\n\t\n\t\t\t\n\t\t\t\tOpen Menu\n\t\t\t\n\t\t\t\n\t\t\t\tClose Menu\n\t\t\t\n\t\t\t\n\t\t\t\tMac\n\t\t\t\tiPad\n\t\t\t\tiPhone\n\t\t\t\tWatch\n\t\t\t\tTV\n\t\t\t\tMusic\n\t\t\t\tiTunes\n\t\t\t\tHomePod\n\t\t\t\tiPod\n\t\t\t\tAccessories\n\t\t\t\tGift Cards\n\t\t\t\n\t\t\n\t\n\t\n\t\t\n\t\t\t\n\t\tApple Store\n\t\n\t\t\t\n\t\t\t\tOpen Menu\n\t\t\t\n\t\t\t\n\t\t\t\tClose Menu\n\t\t\t\n\t\t\t\n\t\t\t\tFind a Store\n\t\t\t\tGenius Bar\n\t\t\t\tToday at Apple\n\t\t\t\tApple Camp\n\t\t\t\tField Trip\n\t\t\t\tApple Store App\n\t\t\t\tRefurbished and Clearance\n\t\t\t\tFinancing\n\t\t\t\tReuse and Recycling\n\t\t\t\tOrder Status\n\t\t\t\tShopping Help\n\t\t\t\n\t\t\n\t\n\t\n\t\t\n\t\t\n\t\t\t\n\t\t\t\t\t\t\t\tFor Education\n\t\t\t\t\t\t\t\n\t\t\t\n\t\t\t\tOpen Menu\n\t\t\t\n\t\t\t\n\t\t\t\tClose Menu\n\t\t\t\n\t\t\t\n\t\t\t\tApple and Education\n\t\t\t\tShop for College\n\t\t\t\n\t\t\n\t\t\n\t\t\n\t\t\t\n\t\t\t\t\t\t\t\tFor Business\n\t\t\t\t\t\t\t\n\t\t\t\n\t\t\t\tOpen Menu\n\t\t\t\n\t\t\t\n\t\t\t\tClose Menu\n\t\t\t\n\t\t\t\n\t\t\t\tApple and Business\n\t\t\t\tShop for Business\n\t\t\t\n\t\t\n\t\n\t\n\t\t\n\t\t\n\t\t\t\n\t\t\t\t\t\t\t\tAccount\n\t\t\t\t\t\t\t\n\t\t\t\n\t\t\t\tOpen Menu\n\t\t\t\n\t\t\t\n\t\t\t\tClose Menu\n\t\t\t\n\t\t\t\n\t\t\t\tManage Your Apple ID\n\t\t\t\tApple Store Account\n\t\t\t\tiCloud.com\n\t\t\t\n\t\t\n\t\t\n\t\t\n\t\t\t\n\t\t\t\t\t\t\t\tApple Values\n\t\t\t\t\t\t\t\n\t\t\t\n\t\t\t\tOpen Menu\n\t\t\t\n\t\t\t\n\t\t\t\tClose Menu\n\t\t\t\n\t\t\t\n\t\t\t\tAccessibility\n\t\t\t\tEducation\n\t\t\t\tEnvironment\n\t\t\t\tInclusion and Diversity\n\t\t\t\tPrivacy\n\t\t\t\tSupplier Responsibility\n\t\t\t\n\t\t\n\t\n\t\n\t\t\n\t\t\n\t\t\t\n\t\t\t\t\t\tAbout Apple\n\t\t\t\t\t\n\t\t\t\n\t\t\t\tOpen Menu\n\t\t\t\n\t\t\t\n\t\t\t\tClose Menu\n\t\t\t\n\t\t\t\n\t\t\t\tNewsroom\n\t\t\t\tApple Leadership\n\t\t\t\tJob Opportunities\n\t\t\t\tInvestors\n\t\t\t\tEvents\n\t\t\t\tContact Apple\n\t\t\t\n\t\t\n\t\n\t\n\n\n\n\t\n\t\tMore ways to shop: Visit an Apple Store, call 1-800-MY-APPLE, or find a reseller.\n\t\n\t\n\t\tUnited States\n\t\n\t\n\t\tCopyright © 2017 Apple Inc. All rights reserved.\n\t\t\n\t\t\tPrivacy Policy\n\t\t\tTerms of Use\n\t\t\tSales and Refunds\n\t\t\tLegal\n\t\t\tSite Map\n\t\t\n\t\n\n\n\n\n\n\n\t\t\n\t\n\t"
    },
    {
      "Type": -1,
      "Text": "\n\n\t\n\n\t\n"
    },
    {
      "Type": 0,
      "Text": "\n\n\n"
    }
  ],
  "meta": {
    "code": 200
  }
};