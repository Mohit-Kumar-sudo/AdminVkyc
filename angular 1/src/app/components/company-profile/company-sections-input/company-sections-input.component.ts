import { Component, OnInit } from '@angular/core';
import { MasterReportData } from 'src/app/models/me-models';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuMetaData, companyProfilesSections } from 'src/app/models/section-metadata';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { LsfServiceService } from 'src/app/services/lsf-service.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import _ from 'lodash';
import { CompanyProfileService } from 'src/app/services/company-profile.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-company-sections-input',
  templateUrl: './company-sections-input.component.html',
  styleUrls: ['./company-sections-input.component.scss']
})
export class CompanySectionsInputComponent implements OnInit {

  currentReport: MasterReportData = null;
  currentCompany: string = '';
  menuList: MenuMetaData[] = companyProfilesSections;
  stock: FormControl = new FormControl();
  leads: FormControl = new FormControl();
  filings: FormControl = new FormControl();
  stockArray: any;
  stockContentCompare: any;
  splitTicker: any;
  splitName: any;
  leadsArray: any;
  noStocks: any;
  noLeads: any;
  leadContentCompare: any;
  filingArray: any;
  noFiling: number;
  checkFiling: any;
  companyId: any;
  leadsSuggest: string;
  company: any;
  dbFiling: any;
  selectedData: any

  constructor(private localStorageService: LocalStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    private lsfService: LsfServiceService,
    private cpService: CompanyProfileService,
    private spinner: NgxSpinnerService  ) { }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    let currentCompanyName = this.localStorageService.get(ConstantKeys.CURRENT_SELECTED_COMPANY_PROFILE_INFO);
    this.currentCompany = currentCompanyName.name;
    this.company = this.activatedRoute.snapshot.queryParams.company_name.trim().toLowerCase().split('corporation').join('');
    this.companyId = this.activatedRoute.snapshot.queryParams.companyId;
    this.getCompanyDetails();
    this.localStorageService.remove(ConstantKeys.CURRENT_COMPANY_FO_SECTION_LIST);
    this.localStorageService.remove(ConstantKeys.CURRENT_COMPANY_FO_SECTION);
    this.leadsChanged();
    this.stocksChanged();
    this.filingsChanged();
  }


  onSectionSelection(menu: MenuMetaData) {
    switch (menu.key) {
      case 'companyOverview':
        this.router.navigate([`company-overview`], { relativeTo: this.activatedRoute });
        break;
      case 'keyDevelopments':
        this.router.navigate([`key-developments`], { relativeTo: this.activatedRoute });
        break;
      case 'strategy':
        this.router.navigate([`strategy`], { relativeTo: this.activatedRoute });
        break;
      case 'financialOverview':
        this.router.navigate([`fo-sections`], { relativeTo: this.activatedRoute });
        break;
      case 'productOfferings':
        this.router.navigate([`product-offering`], { relativeTo: this.activatedRoute });
        break;
      case 'swotAnalysis':
        this.router.navigate([`swot-analysis`], { relativeTo: this.activatedRoute });
        break;
    }
  }

  toPreviousPage() {
    this._location.back();
  }

  stocksChanged() {
    this.stock.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(d => {
      if (d && d.trim()) {
        this.stockSearch(d);
      } else {
        this.stock.reset();
        this.stockArray = [];
      }
    })
  }

  stockOut() {
    if (this.stockContentCompare) {
      this.splitTicker = this.stockContentCompare.split(' ')[0];
      this.splitName = this.stockContentCompare.replace(this.stockContentCompare.split(' ')[0], '');
      let data = {
        companyId: this.companyId,
        leads: this.leadsSuggest ? this.leadsSuggest : "",
        filings: this.checkFiling ? (this.filings.value ? this.filings.value : "") : "",
        stocks: this.splitName ? this.splitName : "",
        ticker: this.splitTicker ? this.splitTicker : ""
      }
      this.cpService.saveSuggestedStocks(data).subscribe(d => {
      }, err => {
        console.log(err);
      })
    }
  }

  leadsChanged() {
    this.leads.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(d => {
      if (d && d.trim()) {
        this.leadSearch(d);
      } else {
        this.leads.reset();
        this.leadsArray = [];
      }
    })
  }

  leadsOut() {
    this.leadsSuggest = '';
    if (this.leadContentCompare && this.leadContentCompare.length) {
      this.leadContentCompare.forEach(d => {
        this.leadsSuggest = this.leadsSuggest + d + ',   ';
      });
    }
    let data = {
      companyId: this.companyId,
      lead_suggest: this.leadsSuggest ? (this.leadContentCompare ? this.leadContentCompare : []) : [],
      leads: this.leadsSuggest ? this.leadsSuggest : "",
      filings: this.checkFiling ? (this.filings.value ? this.filings.value : "") : "",
      filing_suggest: this.filingArray ? this.filingArray : [],
      stocks: this.splitName ? this.splitName : "",
      ticker: this.splitTicker ? this.splitTicker : ""
    }
    this.cpService.saveSuggestedLeads(data).subscribe(d => {
    }, err => {
      console.log(err);
    });
  }

  filingsChanged() {
    this.filings.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(d => {
      if (d && d.trim()) {
        this.checkFiling = false;
        this.filingSearch(d);
      } else {
        this.filings.reset();
        this.filingArray = [];
        this.checkFiling = false;
      }
    })
  }

  filingCheck() {
    let data = {
      companyId: this.companyId,
      leads: this.leadsSuggest ? this.leadsSuggest : "",
      filings: this.checkFiling ? (this.filings.value ? this.filings.value : "") : "",
      filing_suggest: this.checkFiling ? (this.filingArray ? this.filingArray : []) : [],
      stocks: this.splitName ? this.splitName : "",
      ticker: this.splitTicker ? this.splitTicker : ""
    }
    this.cpService.saveSuggestedFilings(data).subscribe(d => {
      // console.log(d);
    }, err => {
      console.log(err);
    })
  }

  stockSearch(name) {
    this.lsfService.stockSearchService(name).subscribe(data => {
      if (data && data.bestMatches && data.bestMatches.length) {
        this.stockArray = data.bestMatches;
      } else {
        this.stockArray = [];
        this.splitName = "";
        this.splitTicker = "";
        this.stockContentCompare = "";
      }
    }, err => {
      console.log(err);
    })
  }

  leadSearch(name) {
    this.lsfService.searchCompanyName(name).then(data => {
      if (data && data.list && data.list.length) {
        this.leadsArray = data.list;
      } else {
        this.leadsArray = [];
        this.leadContentCompare = [];
      }
    }).catch(err => {
      console.log(err);
    })
  }

  filingSearch(name) {
    this.selectedData = {
      category: "all",
      dateRange: "custom",
      enddt: null,
      entityName: "",
      forms: [],
      from: 0,
      locationCode: "all",
      locationType: "located",
      page: "1",
      q: name,
      startdt: "2000-01-01"
    }
    this.lsfService.searchFilings(this.selectedData).subscribe(data => {
      if (data && data.data && data.data.hits && data.data.hits.hits && data.data.hits.hits.length) {
        this.filingArray = _.map(data.data.hits.hits, '_source');
        this.checkFiling = this.dbFiling ? true : false;
        this.dbFiling = '';
      } else {
        this.filingArray = [];
        this.checkFiling = false;
        this.dbFiling = '';
      }
    }, err => {
      console.log(err);
    })
  }

  getCompanyDetails() {
    this.spinner.show();
    this.cpService.getInterconnects(this.companyId, "inter_connect,company_name,lead_suggest,filing_suggest").subscribe(d => {
      if (d && d.length) {
        this.spinner.hide();
        if (d[0].lead_suggest && d[0].lead_suggest.length && d[0].inter_connect && d[0].inter_connect.leads && d[0].inter_connect.leads.length) {
          this.leadContentCompare = d[0].lead_suggest;
          this.leads.setValue(this.leadContentCompare[0]);
          this.leadsSuggest = ''
          this.leadContentCompare.forEach(l => {
            this.leadsSuggest = this.leadsSuggest + l + ",   ";
          });       
        } else {
          this.leads.setValue(this.company.trim());
        } if (d[0].inter_connect && d[0].inter_connect.stocks && d[0].inter_connect.stocks.ticker && d[0].inter_connect.stocks.ticker.trim().length) {
          this.stockContentCompare = `${d[0].inter_connect.stocks.ticker && d[0].inter_connect.stocks.ticker.trim()} ${d[0].inter_connect.stocks.ticker && d[0].inter_connect.stocks.name.trim()}`;
          this.splitName = d[0].inter_connect.stocks.ticker && d[0].inter_connect.stocks.name;
          this.splitTicker = d[0].inter_connect.stocks.ticker && d[0].inter_connect.stocks.ticker;
          this.stock.setValue(this.splitTicker.trim());
        } else {
          this.stock.setValue(this.company.trim())
        } if (d[0].inter_connect && d[0].inter_connect.filings && d[0].inter_connect.filings.length && d[0].filing_suggest && d[0].filing_suggest.length) {
          this.filingArray = d[0].filing_suggest;
          this.checkFiling = true;
          this.dbFiling = d[0].inter_connect.filings;
          this.filings.setValue(this.dbFiling);
        } else {
          this.filings.setValue(this.company.trim());
        }
      }else{
        this.spinner.hide();
      }
    }, err => {
      console.log(err);
      this.spinner.hide();
    })
  }
}
