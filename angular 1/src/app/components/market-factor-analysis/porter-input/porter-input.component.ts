import { Component, OnInit } from '@angular/core';
import { MasterReportData, TocSectionData } from 'src/app/models/me-models';
import { MenuMetaData, getSubSectionMenuInfo, getMenuMetadataById } from 'src/app/models/section-metadata';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ReportMetadataService } from 'src/app/services/report-metadata.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { Location } from '@angular/common';
import { PortersApiService } from 'src/app/services/porters/portersApi.service';
import { MasterReportSecondarySection } from 'src/app/models/secondary-research-models';
import * as _ from 'lodash';

@Component({
  selector: 'app-porter-input',
  templateUrl: './porter-input.component.html',
  styleUrls: ['./porter-input.component.scss']
})
export class PorterInputComponent implements OnInit {

  sendData = [];

  defaultInputList = [];

  defaultInput = [
    {
      name : "Capital requirement to gain entry",
      type : "Threat of New Entrants",
      dataType : "default",
      rating : 0
    },
    {
      name : "Retaliation by existing companies to new player entry",
      type : "Threat of New Entrants",
      dataType : "default",
      rating : 0
    },
    {
      name : "Legal barriers to market entry",
      type : "Threat of New Entrants",
      dataType : "default",
      rating : 0
    },
    {
      name : "Brand value effect",
      type : "Threat of New Entrants",
      dataType : "default",
      rating : 0
    },
    {
      name : "Product/service differentiation",
      type : "Threat of New Entrants",
      dataType : "default",
      rating : 0
    },
    {
      name : "Ease of access to raw material suppliers and market distributors",
      type : "Threat of New Entrants",
      dataType : "default",
      rating : 0
    },
    {
      name : "Effect of economies of scale",
      type : "Threat of New Entrants",
      dataType : "default",
      rating : 0
    },
    {
      name : "Ease of ROI achievement",
      type : "Threat of New Entrants",
      dataType : "default",
      rating : 0
    },
    {
      name : "Effect of Government regulations",
      type : "Threat of New Entrants",
      dataType : "default",
      rating : 0
    },
    {
      name : "Number of suppliers as compared to market players",
      type : "Bargaining Power of Suppliers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Total market share of top players",
      type : "Bargaining Power of Suppliers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Market concentration/fragmentation",
      type : "Bargaining Power of Suppliers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Raw material availability",
      type : "Bargaining Power of Suppliers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Market players' cost to switch supplier",
      type : "Bargaining Power of Suppliers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Ability of suppliers to integrate forward",
      type : "Bargaining Power of Suppliers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Number of buyers as compared to market players",
      type : "Bargaining Power of Buyers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Concentration of buyers/end-users",
      type : "Bargaining Power of Buyers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Buyer's cost of switching product/service provider",
      type : "Bargaining Power of Buyers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Availability of product/service substitutes",
      type : "Bargaining Power of Buyers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Price sensitivity",
      type : "Bargaining Power of Buyers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Ability of buyers' to integrate backwards",
      type : "Bargaining Power of Buyers",
      dataType : "default",
      rating : 0
    },
    {
      name : "Availability of product/service substitutes",
      type : "Threat of Substitutes",
      dataType : "default",
      rating : 0
    },
    {
      name : "Performance of substitutes/alternatives",
      type : "Threat of Substitutes",
      dataType : "default",
      rating : 0
    },
    {
      name : "Number of market players",
      type : "Segment Rivalry",
      dataType : "default",
      rating : 0
    },
    {
      name : "Exit barriers",
      type : "Segment Rivalry",
      dataType : "default",
      rating : 0
    },
    {
      name : "Market size and growth rate/Market potential",
      type : "Segment Rivalry",
      dataType : "default",
      rating : 0
    },
    {
      name : "Product/service differentiation",
      type : "Segment Rivalry",
      dataType : "default",
      rating : 0
    },
    {
      name : "Total market share of top players",
      type : "Segment Rivalry",
      dataType : "default",
      rating : 0
    },
    {
      name : "Brand value effect",
      type : "Segment Rivalry",
      dataType : "default",
      rating : 0
    },
    {
      name : "Threat of horizontal integration",
      type : "Segment Rivalry",
      dataType : "default",
      rating : 0
    }
  ]

  currentReport: MasterReportData = null;
  selectedSection: TocSectionData = null;
  subSectionInfo: MenuMetaData = null;
  conclusion = '';

  totalElementAdded = 0;
  childSectionName: string = '';
  childSectionEntity: string = '';
  childSectionRating: string = '';
  subSubSectionList = [];
  reportId: any;
  entity_type = [
    'Threat of New Entrants',
    'Bargaining Power of Suppliers',
    'Threat of Substitutes',
    'Bargaining Power of Buyers',
    'Segment Rivalry'
  ];
  data: any = [];
  ratings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  editorConfig = {
    editable: true,
    spellcheck: true,
    height: "200px",
    minHeight: "0",
    width: "730px",
    minWidth: "0",
    placeholder: 'Enter text here...',
    translate: 'no',
    toolbar: [
      ["bold", "italic", "underline", "strikeThrough", "superscript", "subscript"],
      ["link", "unlink"],
      ['unorderedList']
    ]
  };


  constructor(private localStorageService: LocalStorageService,
    private reportMetadataService: ReportMetadataService,
    private portersApiService: PortersApiService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)

    // Current Section Info
    this.selectedSection = currentSection;
    let subSectionList = getSubSectionMenuInfo(this.selectedSection.section_key);
    this.subSectionInfo = getMenuMetadataById(subSectionList, currentSection.actual_section_id);
    this.getPortersData1();

    this.defaultInput.forEach(e => {

      if(!this.defaultInputList.some(function(el) {
        return el.name === e.name;
      })){
        this.defaultInputList.push(e);
      }
    });
  }

  getPortersData1() {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    this.portersApiService.getPortersData(this.currentReport._id, currentSection.section_id, currentSection.main_section_id).subscribe(
      data => { this.getPortersDataSuccess(data) },
      error => {
      }
    );
  }

  getPortersDataSuccess(data) {

    if (data && data.data && data.data.length) {
      data.data.forEach(dataItem => {
        let cnt = 0;
        dataItem.toc.meta.data.forEach(item1 => {
          if (item1.entities) {
            item1.entities.forEach(e => {
              this.subSubSectionList.push(e)
            })
          } else {
            if(item1.dataType == "default"){
              cnt++;
              if(cnt == 1 )  {
                this.defaultInput = [];
                this.defaultInput.push(item1);
              }else{
                this.defaultInput.push(item1);
              }
            }else{
              this.subSubSectionList.push(item1)
            }
          }
        })
      })

      this.subSubSectionList = _.uniqBy(this.subSubSectionList, 'name')
      if(data.data[0].toc && data.data[0].toc.content){
        this.conclusion = data.data[0].toc.content[0].data.content;
      }

    }

    this.defaultInput.forEach(e => {

      if(!this.defaultInputList.some(function(el) {
        return el.name === e.name;
      })){
        this.defaultInputList.push(e);
      }
    });
    if(data && data.data && data.data[0] && data.data[0].toc && data.data[0].toc.meta && data.data[0].toc.meta.data) {
      const apiData = data.data[0].toc.meta.data;
      this.defaultInputList.forEach(item => {
        const tempResult = _.find(apiData,['name', item.name]);
        if(tempResult) {
          item.rating = tempResult.rating;
        }
      });
    }
  }


  addElement() {
    this.totalElementAdded = this.subSubSectionList.length + 1;
    let newSection = {
      _id: this.totalElementAdded + '',
      name: this.childSectionName,
      type: this.childSectionEntity,
      rating: this.childSectionRating,
      dataType : "created"
    }
    this.subSubSectionList.push(newSection);
    this.childSectionName = '';
    this.childSectionEntity = '';
    this.childSectionRating = '';
  }
  removeElement(data) {
    let index = this.subSubSectionList.indexOf(data)
    this.subSubSectionList.splice(index, 1);
  }

  toPreviousPage() {
    this._location.back();
  }

  onSubmit() {
    this.saveMetaInfo();
  }
  addPortersDataSuccess(data) {
  }

  addPortersDataFail(error) {
  }

  saveMetaInfo() {

    this.sendData = [];
    this.subSubSectionList.forEach(e =>{
      this.sendData.push(e);
    })

    this.defaultInputList.forEach(e => {
      this.defaultInput.forEach(el => {
        if(el.name === e.name){
          el.rating = e.rating;
        }
      })
    });

    this.defaultInput.forEach(e => {
      this.sendData.push(e);
    })

    let currentSection: any = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    let metaInfo = {
      type: `PORTERS`,
      data: this.sendData
    }
    currentSection.content = [
      {
        "order_id": 1,
        "type": "TEXT",
        "data": { "content": this.conclusion }
      }
    ];
    currentSection.meta = metaInfo;
    currentSection.section_name = "Porters";

    this.portersApiService.savePortersData(this.currentReport._id, currentSection)
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


}
