import { Injectable } from '@angular/core';
import { CUSTOM, HEADING, IMAGE, ReportDataElement, TABLE, TEXT } from '../models/secondary-research-models';

@Injectable()
export class SampleInputService {
  createReportDataElement = (type: string, data: any, secLength): ReportDataElement => {
    return {
      id: secLength + 1,
      type: type,
      data: data
    };
  }
  generateText = (data, secLength) => {
    return this.createReportDataElement(TEXT, data, secLength);
  }

  generateTextHeading = (data, secLength) => {
    return this.createReportDataElement(HEADING, data, secLength);
  }
  generateImage = (imgUrl, title, secLength) => {
    let data = {
      "metaDataValue": {
        "source": "MRFR Analysis",
        "title": title,
        "type": "3"
      },
      "imageUrl": imgUrl
    }
    return this.createReportDataElement(IMAGE, data, secLength);
  }
  convertIntoHeading = (str) => {
    return "<b>" + str + "</b>"
  }
  convertToList = (array) => {
    let allList = []
    let list = "<ul>"
    array.forEach(ele => {
      list = list + "<li>" + ele + "</li>"
    });
    list = list + "</ul>"
    allList.push(list)
    return allList
  }
  generateHeading(reportTitle, segment, secLength) {
    const dataNode = this.createReportDataElement(HEADING, reportTitle.trim() + " by " + segment, secLength)
    return dataNode
  }
  generateCustomTable(tableData, title, secLength) {
    const dataNode = this.createReportDataElement(CUSTOM, {
      "title": title,
      "data": tableData
    }, secLength);
    return dataNode
  }
  generateTable(title, rows, columns, dataStore, cols, secLength) {
    let data = {
      "cols": cols,
      "metaDataValue": {
        "source": "MRFR Analysis",
        "title": title,
        "rows": rows,
        "columns": columns
      },
      "dataStore": dataStore
    }
    return this.createReportDataElement(TABLE, data, secLength);
  }
}