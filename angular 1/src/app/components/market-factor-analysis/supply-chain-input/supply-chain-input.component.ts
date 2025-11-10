import {Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import {NodeModel} from 'src/app/models/supplyChain/node.model';
import {PathOperationService} from 'src/app/services/supplyChain/pathOperation.service';

import * as mermaid from 'mermaid';
import svgToImage from 'svg-to-image';
import getContext from 'get-canvas-context';
import {MasterReportData, TocSectionData} from 'src/app/models/me-models';
import {MenuMetaData, getSubSectionMenuInfo, getMenuMetadataById} from 'src/app/models/section-metadata';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ReportMetadataService} from 'src/app/services/report-metadata.service';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {SupplyChainApiService} from 'src/app/services/supplyChain/supplyChainApi.service';
import {TextInputComponent} from '../../core/text-input/text-input.component';
import {Location} from '@angular/common';
import {ListInputComponent} from '../../core/list-input/list-input.component';

@Component({
  selector: 'app-supply-chain-input',
  templateUrl: './supply-chain-input.component.html',
  styleUrls: ['./supply-chain-input.component.scss']
})
export class SupplyChainInputComponent implements OnInit {

  currentReport: MasterReportData = null;
  selectedSection: TocSectionData = null;
  subSectionInfo: MenuMetaData = null;

  totalNodes: number = 0;
  nodes: any = [];
  editClicked: boolean = false;
  selectedId: String = '';

  editName = '';
  editDescription = '';
  editList = '';

  newName: String;
  newDescription: String;
  newList: String;

  modules = {};
  noToolbar = {};
  quillEditorRef;
  typeOption = "SUPPLY CHAIN ANALYSIS";

  totalElementAdded = 0;
  @ViewChild('moduleName') moduleName: ElementRef;
  @ViewChild('moduleDescription') moduleDescription: ElementRef;
  @ViewChild('mermaidId') mermaidId: ElementRef;
  paths = [];
  to: any;
  from: any;
  chartText: String = '';
  output = '';
  element: any;
  svgCode: any = '';
  context: any;
  data: any;
  canvas: any;
  index = 0;
  isQueryParams: boolean = false;

  objectKeys = Object.keys;

  allIds = [];
  allPathIds = [];

  constructor(private changeDetector: ChangeDetectorRef,
              private supplyChainApiService: SupplyChainApiService,
              private pathOperationService: PathOperationService,
              private localStorageService: LocalStorageService,
              private reportMetadataService: ReportMetadataService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private _snackBar: MatSnackBar,
              private _location: Location) {

    mermaid.initialize({startOnLoad: false, securityLevel: 'loose', flowchart: {htmlLabels: false}});

    this.modules = {
      toolbar: [['bold'], ['italic'], ['underline'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        [{'script': 'sub'}, {'script': 'super'}], ['link']]
    };
    this.noToolbar = {
      'modules': {
        'toolbar': false
      }
    };
  }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.selectedSection = currentSection;
    let subSectionList = getSubSectionMenuInfo(this.selectedSection.section_key);
    this.subSectionInfo = getMenuMetadataById(subSectionList, currentSection.actual_section_id);
    this.getSupplyChainData1();
    const params = this.activatedRoute.snapshot.queryParams;
    if (params && params.chainType) {
      this.isQueryParams = true;
      if (params.chainType == 'supplyChain') {
        this.typeOption = 'SUPPLY CHAIN ANALYSIS'
      } else if (params.chainType == 'valueChain') {
        this.typeOption = 'VALUE CHAIN ANALYSIS'
      }
    }
  }

  getSupplyChainData1() {

    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.supplyChainApiService.getSupplyChainData(this.currentReport._id, currentSection.section_id, currentSection.main_section_id).subscribe(
      data => {
        this.getSupplyChainDataSuccess(data);
      },
      error => {
      }
    );
  }

  getSupplyChainDataSuccess(data) {
    if (data && data.data && data.data.length > 0) {
      this.nodes = data.data[0].toc.content;
      this.paths = data.data[0].toc.meta.data;
      this.typeOption = data.data[0].toc.meta.chain_type;
    }
    this.generateChart();
  }

  getEditorInstance(editorInstance: any) {
    this.quillEditorRef = editorInstance;
    const toolbar = editorInstance.getModule('toolbar');
  }

  onTextOption(selectedEle) {

    const dialogRef = this.dialog.open(TextInputComponent, {
      width: '60%',
      data: selectedEle.data[0].info,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.length) {
        let index = this.nodes.indexOf(selectedEle);
        this.nodes[index].data[0].info = result;
      }
    });
  }

  addElement() {

    this.allIds = [];
    this.nodes.forEach(element => {
      let order_id = parseInt(element.order_id)
      this.allIds.push(order_id);
    });
    let maxId = 0;
    if (this.allIds.length)
      maxId = Math.max(...this.allIds);
    let newOrderId = maxId + 1;

    this.newName = this.newName.replace(/-/g, ' ');

    let newSection = {
      order_id: newOrderId + '',
      type: 'ARRAY',
      data: [
        {
          type: 'TEXT',
          info: ''
        },
        {
          type: 'TABLE',
          info: []
        }
      ],
      title: this.newName
    };
    this.nodes.push(newSection);
    this.newName = '';
  }

  onListOption(selectedEle: any = null, dataValue = null) {
    dataValue = [];
    if (selectedEle && selectedEle.data && selectedEle.data.length) {
      selectedEle.data.forEach(element => {
        if (element.type == "TABLE") {
          if (element.info && element.info.length) {
            element.info.forEach(ele => {
              dataValue.push(ele);
            });
          }
        }
      });
    }

    const dialogRef = this.dialog.open(ListInputComponent, {
      width: '60%',
      data: dataValue,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      let index = this.nodes.indexOf(selectedEle);
      this.nodes[index].data[1].info = [];
      result.forEach(element => {
        this.nodes[index].data[1].info.push(element)
      });
    });
  }

  addNewPath() {

    this.allPathIds = [];
    this.nodes.forEach(element => {
      let order_id = parseInt(element.order_id)
      this.allPathIds.push(order_id);
    });
    let maxId = 0;
    if (this.allPathIds.length)
      maxId = Math.max(...this.allPathIds);
    let newOrderId = maxId + 1;

    let newSection = {
      _id: newOrderId,
      to: this.to,
      from: this.from
    };
    this.paths.push(newSection);
    this.to = {};
    this.from = {};


    this.generateChart();

  }

  removePath(data) {
    let index = this.paths.indexOf(data);
    this.paths.splice(index, 1);
    this.generateChart();
  }

  removeElement(data) {
    let index = this.nodes.indexOf(data);
    this.nodes.splice(index, 1);
  }

  onSubmit() {
    this.saveMetaInfo();
  }

  saveMetaInfo() {
    let currentSection: any = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    let metaInfo = {
      type: `SUPPLY_CHAIN`,
      chain_type: this.typeOption,
      data: this.paths
    };
    currentSection.content = this.nodes;
    currentSection.meta = metaInfo;
    currentSection.section_name = "Suuply / Value Chain Analysis";
    this.supplyChainApiService.saveSupplyChainData(this.currentReport._id, currentSection)
      .subscribe(data => {
        this._snackBar.open('Selected Data saved to platform', 'Close', {
          duration: 2000,
        });

      }, (err) => {
        this._snackBar.open('Error occured while submitting to platform', 'Close', {
          duration: 2000,
        });
      });

  }

  toPreviousPage() {
    this._location.back();
  }

  generateChart() {
    this.chartText = '';
    let text = 'graph LR;';
    for (let i = 0; i < this.paths.length; i++) {
      text += this.paths[i].from.order_id + '[' + this.paths[i].from.title + '] -->'
        + this.paths[i].to.order_id + '[' + this.paths[i].to.title + '];';
    }
    this.chartText = text;

    this.svgCode = '';
    if (!this.chartText) {
      this.chartText = 'graph TD;';
    }

    if (document.getElementById('graphDiv')) {
      document.getElementById('graphDiv').remove();
    }
    const element: any = this.mermaidId.nativeElement;
    mermaid.render('graphDiv', this.chartText, (svgCode, bindFunctions) => {
      element.innerHTML = svgCode;
      this.svgCode = svgCode;
      document.getElementById('graphDiv').style.maxWidth = "";

    });
  }

  public trackItem(index: number, item: NodeModel) {
    return item.name;
  }

  onPathDeleteClick(_id) {
    this.pathOperationService
      .delete(_id)
      .subscribe(() => {
        this.paths = this.paths.filter(paths => paths._id != _id);
        this.generateChart();
      });
  }


  svgToImageConverter() {
    this.context = getContext('2d', {
      width: 200,
      height: 200
    });

    this.data = [this.svgCode].join('\n');

    svgToImage(this.data, (err, image) => {
      if (err) {
      } else {
        this.context.drawImage(image, 0, 0);
        this.canvas = this.context.canvas;
        let aaa = document.getElementById('myGraph');
        if (this.context.canvas && aaa) {
          let e = document.getElementsByTagName('canvas')[0];
          if (e) {
            document.getElementById('myGraph').removeChild(e);
          } else {
          }

          document.getElementById('myGraph').append(this.context.canvas);
        }
      }
    });
  }


}
