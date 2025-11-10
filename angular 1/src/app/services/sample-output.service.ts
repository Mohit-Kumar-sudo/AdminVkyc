import { Injectable } from '@angular/core';

@Injectable()
export class SampleOutputService {
    createChild = (tocContent, name, level, id, subSegment?) => {
        name = this.getSegRefactored(name);
        let index = 2
        if (subSegment)
            index = subSegment + 2
        if (tocContent && tocContent.children) {
            index = tocContent.children.length + 1
        }
        let child = {
            id: id + "." + index,
            name: name,
            level: level,
            children: []
        }
        return child
    }

    generateHeading = (id, name, level, secLength) => {
        let secData = {
            id: secLength + 1,
            type: "HEADING",
            data: {
                id: id,
                level: level,
                name: name
            }
        }
        return secData
    }
    getSegRefactored(seg) {
        let splits = seg.split('_');
        if(splits.length > 1) {
             return splits[splits.length - 1];
        }
        return seg;
      }
}