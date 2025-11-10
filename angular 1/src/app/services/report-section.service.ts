import {Injectable} from '@angular/core';
import {
  BAR,
  BarChartData,
  CustomTableData,
  CUSTOM_TABLE,
  IMAGE,
  ImageData,
  PIE,
  PieChartData,
  ReportDataElement,
  SecondaryDataElement,
  TABLE,
  TableData,
  TEXT,
  TextData,
  CUSTOM, HEADING
} from '../models/secondary-research-models';
import {ReportMetadataService} from './report-metadata.service';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class ReportSectionService {

  constructor(private reportMetadataService: ReportMetadataService) {
  }

  convertToSecondaryDataElement(reportElements: ReportDataElement[]) {
    return reportElements.map(element => {
      let secEle: SecondaryDataElement = {
        order_id: element.id,
        type: element.type,
        data: this.formatReportElementToString(element)
      };
      return secEle;
    });
  }

  formatReportElementToString(reportElement: ReportDataElement) {
    let contentStr;
    switch (reportElement.type) {
      case TEXT:
        let textData: TextData = {
          content: reportElement.data.toString()
        };
        contentStr = textData; //JSON.stringify(textData);
        break;
      case HEADING:
        let headingData: TextData = {
          content: reportElement.data.toString()
        };
        contentStr = headingData; //JSON.stringify(textData);
        break;  
      case TABLE:
        let tableData: TableData = {
          title: reportElement.data.metaDataValue.title,
          source: reportElement.data.metaDataValue.source,
          rows: reportElement.data.metaDataValue.rows,
          columns: reportElement.data.cols,
          dataStore: reportElement.data.dataStore,
        };
        contentStr = tableData; //JSON.stringify(tableData);
        break;
      case IMAGE:
        let imageData: ImageData = {
          title: reportElement.data.metaDataValue.title,
          source: reportElement.data.metaDataValue.source,
          type: reportElement.data.metaDataValue.type,
          imageUrl: reportElement.data.imageUrl
        };
        contentStr = imageData ; //JSON.stringify(imageData);
        break;
      case PIE:
        let pieChartData: PieChartData = {
          title: reportElement.data.metaDataValue.title,
          source: reportElement.data.metaDataValue.source,
          calType: reportElement.data.metaDataValue.calType,
          columns: reportElement.data.metaDataValue.columns,
        };
        contentStr = pieChartData; //JSON.stringify(pieChartData);
        break;
      case BAR:
        let barChartData: BarChartData = {
          title: reportElement.data.metaDataValue.title,
          source: reportElement.data.metaDataValue.source,
          labelX: reportElement.data.metaDataValue.labelX,
          labelY: reportElement.data.metaDataValue.labelY,
          columnMetaData: reportElement.data.colMetaData,
          dataStore: reportElement.data.dataStore,
        };
        contentStr = barChartData; //JSON.stringify(barChartData);
        break;
      case CUSTOM_TABLE:
        let customTable: CustomTableData = {
          title: reportElement.data.title,
          data: reportElement.data.data
        };
        contentStr = customTable;
        break;  
      case CUSTOM:
        let custom: CustomTableData = {
          title: reportElement.data.title,
          data: reportElement.data.data
        };
        contentStr = custom;
        break;    
      default:
        contentStr = '';
    }
    return contentStr;
  }


  convertToReportDataElement(reportElements: SecondaryDataElement[]): ReportDataElement[] {
    return reportElements.map(element => {
      return this.mapToReportElementByType(element);
    });
  }

  mapToReportElementByType(element: SecondaryDataElement) {
    switch (element.type) {
      case TEXT:
        return this.convertToTextFormat(element);
      case IMAGE:
        return this.convertToImageFormat(element);
      case PIE:
        return this.convertToPieChartFormat(element);
      case TABLE:
        return this.convertToTableFormat(element);
      case BAR:
        return this.convertToBarChartFormat(element);
      case CUSTOM_TABLE:
        return this.convertToCustomTableFormat(element);
      case CUSTOM:
        return this.convertToCustomFormat(element);
      case HEADING:
        return this.convertToTextFormat(element);
    }
  }

  convertToTextFormat(element) {
    try {
      return {
        id: element.order_id,
        type: element.type,
        data: (typeof (element.data) === "string") ? JSON.parse(element.data).content : element.data.content
      };
    } catch (error) {
      console.error('error in converting =>', element);
      console.error(error);
    }
  }

  convertToImageFormat(element) {
    const imageContent = (typeof (element.data) === "string") ? JSON.parse(element.data) : element.data;
    return {
      id: element.order_id,
      type: element.type,
      data: {
        imageUrl: imageContent.imageUrl,
        metaDataValue: {
          source: imageContent.source,
          title: imageContent.title,
          type: imageContent.type
        }
      }
    };
  }

  convertToPieChartFormat(element) {
    const pieContent = (typeof (element.data) === "string") ? JSON.parse(element.data) : element.data;
    const labelsArray = [];
    const valuesArray = [];
    pieContent.columns.forEach(col => {
      labelsArray.push(col.header);
      valuesArray.push(col.value);
    });
    return {
      id: element.order_id,
      type: element.type,
      data: {
        chartData: valuesArray,
        chartLabels: labelsArray,
        metaDataValue: pieContent
      }
    };
  }

  convertToTableFormat(element) {
    const tableContent = (typeof (element.data) === "string") ? JSON.parse(element.data) : element.data;
    const columnsObj = [];
    tableContent.columns.forEach(item => {
      columnsObj.push({header: item});
    });
    return {
      id: element.order_id,
      type: element.type,
      data: {
        cols: tableContent.columns,
        dataStore: tableContent.dataStore,
        metaDataValue: {
          columns: columnsObj,
          rows: tableContent.rows,
          source: tableContent.source,
          title: tableContent.title
        }
      }
    };
  }

  convertToBarChartFormat(element) {
    const barContent = (typeof (element.data) === "string") ? JSON.parse(element.data) : element.data;
    const charData = [];
    const keys = _.keys(barContent.dataStore[0]);
    _.remove(keys, (n) => n === 'rowHeader');
    const temp = [];
    barContent.dataStore.forEach(item => {
      keys.forEach(k => {
        if (!temp.includes(k)) {
          const charElement = {
            label: k,
            data: _.map(barContent.dataStore, k),
          };
          temp.push(k);
          charData.push(charElement);
        }
      });
    });
    return {
      id: element.order_id,
      type: element.type,
      data: {
        chartData: charData,
        chartLabels: _.map(barContent.dataStore, 'rowHeader'),
        colMetaData: barContent.colMetaData,
        dataStore: barContent.dataStore,
        metaDataValue: {
          labelX: barContent.labelX,
          labelY: barContent.labelY,
          source: barContent.source,
          title: barContent.title
        }
      }
    };
  }

  convertToCustomTableFormat(element) {
    try {
      const tableContent = (typeof (element.data) === "string") ? JSON.parse(element.data) : element.data;
      return {
        id: element.order_id,
        type: element.type,
        data: {
          title: tableContent.title,
          data: tableContent.data
        }
      };
    } catch (error) {
      console.error('error in converting =>', element);
      console.error(error);
    }
  }
  convertToCustomFormat(element) {
    try {
      const tableContent = (typeof (element.data) === "string") ? JSON.parse(element.data) : element.data;
      return {
        id: element.order_id,
        type: element.type,
        data: {
          title: tableContent.title,
          data: tableContent.data
        }
      };
    } catch (error) {
      console.error('error in converting =>', element);
      console.error(error);
    }
  }
}
