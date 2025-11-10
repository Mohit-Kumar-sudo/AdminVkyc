import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomMaterialModule } from './material-config/material.module';
import { NgxEditorModule } from 'ngx-editor';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ChartsModule } from 'ng2-charts';

import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { LocalStorageService } from './services/localsotrage.service';
import { TokenInterceptorService } from './services/guards/token-interceptor.service';
import { AuthGuardService } from './services/guards/auth-guard.service';
import { ReportService } from './services/report.service';
import { ReportMetadataService } from './services/report-metadata.service';

import { HeaderComponent } from './components/shared/header/header.component';
import { LoginComponent } from './components/user/login/login.component';
import { RegisterComponent } from './components/user/register/register.component';
import { HomeComponent } from './components/shared/home/home.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { TreeGridComponent } from './components/core/tree-grid/tree-grid.component';
import { MultidatepickerModule } from '@julianobrasil/multidatepicker';
import { SegmentCreationComponent } from './components/market-estimation/segment-creation/segment-creation.component';
import { ReportFormComponent } from './components/master-report/report-form/report-form.component';
import { RegionCountryFormComponent } from './components/market-estimation/region-country-form/region-country-form.component';
import { KvMultiSelectComponent } from './components/core/kv-multi-select/kv-multi-select.component';
import { SecondaryResearchInputElementComponent } from './components/secondary-research-input/secondary-research-input-element/secondary-research-input-element.component';
import { TextInputComponent } from './components/core/text-input/text-input.component';
import { TableInputComponent } from './components/core/table-input/table-input.component';
import { ImageInputComponent } from './components/core/image-input/image-input.component';
import { PieChartInputComponent } from './components/core/pie-chart-input/pie-chart-input.component';
import { BarChartInputComponent } from './components/core/bar-chart-input/bar-chart-input.component';
import { EditableGridComponent } from './components/core/table-input/editable-grid/editable-grid.component';
import { ReportSearchListComponent } from './components/master-report/report-search-list/report-search-list.component';
import { ReportInfoComponent } from './components/master-report/report-info/report-info.component';
import { ReportGlobalInfoComponent } from './components/master-report/report-global-info/report-global-info.component';
import { MarketDynamicsNewComponent } from './components/market-dynamics/market-dynamics-new/market-dynamics-new.component';
import { MarketIntroductionNewComponent } from './components/market-introduction/market-introduction-new/market-introduction-new.component';
import { ExecutiveSummaryNewComponent } from './components/executive-summary/executive-summary-new/executive-summary-new.component';
import { MarketFactorAnalysisNewComponent } from './components/market-factor-analysis/market-factor-analysis-new/market-factor-analysis-new.component';
import { CompetitiveLandscapeNewComponent } from './components/competitive-landscape/competitive-landscape-new/competitive-landscape-new.component';
import {
  CompanyProfileNewComponent,
  DeleteCompanyProfileDialog
} from './components/company-profile/company-profile-new/company-profile-new.component';
import { MultiLevelInputComponent } from './components/market-dynamics/multi-level-input/multi-level-input.component';
import { IndustryInsightsNewComponent } from './components/industry-insights/industry-insights-new/industry-insights-new.component';
import { SecondaryResearchInputWrapperComponent } from './components/secondary-research-input/secondary-research-input-wrapper/secondary-research-input-wrapper.component';
import { SecondaryResearchInputComponent } from './components/secondary-research-input/secondary-research-input.component';
import { ImportExportTrendsNewComponent } from './components/import-export-trends/import-export-trends-new/import-export-trends-new.component';
import { MacroIndicatorsNewComponent } from './components/macro-indicators/macro-indicators-new/macro-indicators-new.component';
import { MarketInsightsNewComponent } from './components/market-insights/market-insights-new/market-insights-new.component';
import { OilGasSectorOverviewNewComponent } from './components/oil-gas-sector-overview/oil-gas-sector-overview-new/oil-gas-sector-overview-new.component';
import { PowerSectorOverviewNewComponent } from './components/power-sector-overview/power-sector-overview-new/power-sector-overview-new.component';
import { ParentMarketAnalysisNewComponent } from './components/parent-market-analysis/parent-market-analysis-new/parent-market-analysis-new.component';
import { MarketOverviewNewComponent } from './components/market-overview/market-overview-new/market-overview-new.component';
import { PipelineAnalysisNewComponent } from './components/pipeline-analysis/pipeline-analysis-new/pipeline-analysis-new.component';
import { RegulatoryLandscapeNewComponent } from './components/regulatory-landscape/regulatory-landscape-new/regulatory-landscape-new.component';
import { PricingAnalysisNewComponent } from './components/pricing-analysis/pricing-analysis-new/pricing-analysis-new.component';
import { BrandShareAnalysisNewComponent } from './components/brand-share-analysis/brand-share-analysis-new/brand-share-analysis-new.component';
import { FutureScenarioNewComponent } from './components/future-scenario/future-scenario-new/future-scenario-new.component';
import { ProductionOutlookNewComponent } from './components/production-outlook/production-outlook-new/production-outlook-new.component';
import { TradeLandscapeNewComponent } from './components/trade-landscape/trade-landscape-new/trade-landscape-new.component';
import { PricingRawMaterialScenarioNewComponent } from './components/pricing-raw-material-scenario/pricing-raw-material-scenario-new/pricing-raw-material-scenario-new.component';
import { MarDynRatingStrengthComponent } from './components/market-dynamics/mar-dyn-rating-strength/mar-dyn-rating-strength.component';
import { CompanySectionsInputComponent } from './components/company-profile/company-sections-input/company-sections-input.component';
import { CompanySwotAnalysisComponent } from './components/company-profile/company-swot-analysis/company-swot-analysis.component';
import { CompanyFoSectionsComponent } from './components/company-profile/company-fo-sections/company-fo-sections.component';
import { CompanyFoSectionNewComponent } from './components/company-profile/company-fo-sections/company-fo-section-new/company-fo-section-new.component';
import { ProductOfferingComponent } from './components/company-profile/product-offering/product-offering.component';
import { ReportSectionService } from './services/report-section.service';
import { GeoDataService } from './services/geo-data.service';
import { SupplyChainApiService } from './services/supplyChain/supplyChainApi.service';
import { SupplyChainOperationService } from './services/supplyChain/supplyChainOperationService.service';
import { PortersOperationService } from './services/porters/portersOperationService.service';
import { PortersApiService } from './services/porters/portersApi.service';

import { QuillModule } from 'ngx-quill';
import { PathApiService } from './services/supplyChain/pathApi.service';
import { PathOperationService } from './services/supplyChain/pathOperation.service';
import { SupplyChainInputComponent } from './components/market-factor-analysis/supply-chain-input/supply-chain-input.component';
import { PorterInputComponent } from './components/market-factor-analysis/porter-input/porter-input.component';
import { TabulatorGridComponent } from './components/market-estimation/tabulator-grid/tabulator-grid.component';
import { MeGridSectionComponent } from './components/market-estimation/me-grid-section/me-grid-section.component';
import { MeGridRegionSectionComponent } from './components/market-estimation/me-grid-region-section/me-grid-region-section.component';
import { MeGridDataInfoComponent } from './components/market-estimation/me-grid-data-info/me-grid-data-info.component';
import { TextTableDataComponent } from './components/core/text-table-data/text-table-data.component';
import { FullReviewReportComponent } from './components/full-review-report/full-review-report.component';
import { CompanyProfileService } from './services/company-profile.service';
import { CpSecondaryElementComponent } from './components/company-profile/cp-secondary-element/cp-secondary-element.component';
import { CpOverviewComponent } from './components/company-profile/cp-overview/cp-overview.component';
import { CpKeyDevelopmentsComponent } from './components/company-profile/cp-key-developments/cp-key-developments.component';
import { CpStrategyComponent } from './components/company-profile/cp-strategy/cp-strategy.component';
import { ListInputComponent } from './components/core/list-input/list-input.component';
import { OtherModuleComponent } from './components/other-module/other-module.component';
import { SharedDataElementComponent } from './components/full-review-report/shared-data-element/shared-data-element.component';
import { CompetitorDashboardComponent } from './components/competitor-dashboard/competitor-dashboard.component';
import { ValueFromKeyPipe } from './pipes/valueFromKey.pipe';
import { CompetitiveDashboardServiceApi } from './services/competitiveDashboard.serviceApi';
import { StartOnlyWithAlphabetsPipe } from './pipes/startOnlyWithAlphabets.pipe';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PapaParseModule } from 'ngx-papaparse';
import { VerifyEmailComponent } from './components/user/verify-email/verify-email.component';
import { AdminPanelComponent } from './administrator/admin-panel/admin-panel.component';
import { PorterInputNonTechComponent } from './components/market-factor-analysis/porter-input-nontech/porter-input-nontech.component';
import { AdminDashboardComponent } from './administrator/admin-dashboard/admin-dashboard.component';
import { InterconnectAdminComponent } from './administrator/interconnect-admin/interconnect-admin.component';
import { DuplicateCpComponent } from './components/duplicate-cp/duplicate-cp.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {AssignUserReportsComponent} from "./administrator/assign-user-reports/assign-user-reports.component";
import {FeaturedReportsComponent} from "./administrator/featured-reports/featured-reports.component";
import {UserReportsComponent} from "./administrator/modals/user-reports/user-reports.component";
import {MatChipsModule} from "@angular/material/chips";
import { UserFeaturedReportsComponent } from './administrator/modals/user-featured-reports/user-featured-reports.component';
import { SampleReportComponent } from './components/sample-report/sample-report.component';
import { SampleExecutiveSummaryComponent } from './components/sample-report/executive-summary/sample-executive-summary.component';
import { CustomTableInputComponent } from './components/core/custom-table-input/custom-table-input.component';
import { SampleReportOutputComponent } from './components/sample-report-output/sample-report-output.component';
import { BarChartOutputComponent } from './components/sample-report-output/core/bar-chart-output/bar-chart-output.component';
import { PieChartOutputComponent } from './components/sample-report-output/core/pie-chart-output/pie-chart-output.component';
import { TableOutputComponent } from './components/sample-report-output/core/table-output/table-output.component';
import { ImageOutputComponent } from './components/sample-report-output/core/image-output/image-output.component';
import { CustomTableOutputComponent } from './components/sample-report-output/core/custom-table-output/custom-table-output.component';
import { HeadingOutputComponent } from './components/sample-report-output/core/heading-output/heading-output.component';
import { TableHeadingOutputComponent } from './components/sample-report-output/core/table-heading/table-heading-output.component';
import { SubHeadingOutputComponent } from './components/sample-report-output/core/sub-heading-output/sub-heading-output.component';
import { FigureHeadingOutputComponent } from './components/sample-report-output/core/figure-heading/figure-heading-output.component';
import { ExecutiveSummarySampleOutputComponent } from './components/sample-report-output/executive-summary/executive-summary-sample-output.component';
import { SampleSecondaryOutputComponent } from './components/sample-report-output/core/sample-secondary-ouput/sample-secondary-output.component';
import { MarketIntroductionSampleOutputComponent } from './components/sample-report-output/market-introduction/market-introduction-sample-output.component';
import { TextOutputComponent } from './components/sample-report-output/core/text-output/text-output.component';
import { ResearchMethodologySampleOutputComponent } from './components/sample-report-output/research-methodology/research-methodology-sample-output.component';
import { MarketEstimationSampleOutputComponent } from './components/sample-report-output/market-estimation/market-estimation-sample-output.component';
import { MarketEstimationSecondaryOutputComponent } from './components/sample-report-output/core/market-estimation-secondary-output/market-estimation-secondary-output.component';
import { NonSecondaryTextOutputComponent } from './components/sample-report-output/core/non-secondary-text-output/non-secondary-text-output.component';
import { CompanyProfilesSampleOutputComponent } from './components/sample-report-output/company-profiles/company-profiles-sample-output.component';
import { TableOfContentsSampleOutputComponent } from './components/sample-report-output/table-of-contents/table-of-contents-sample-output.component';
import { TocHeadingOutputComponent } from './components/sample-report-output/core/toc-heading/toc-heading-output.component';
import { SharedSampleTocService } from './services/shared-sample-toc.service';
import { TableBulletLevelOneComponent } from './components/sample-report-output/core/table-bullet-level-one/table-bullet-level-one.component';
import { TableThOutputComponent } from './components/sample-report-output/core/table-th/table-th-output.component';
import { METableOutputComponent } from './components/sample-report-output/core/me-table-output/me-table-output.component';
import {GenerateSampleMarketIntroductionComponent} from "./components/sample-report/generate-sample-market-introduction/generate-sample-market-introduction.component";
import {GenerateSampleMarketDynamicsComponent} from "./components/sample-report/generate-sample-market-dynamics/generate-sample-market-dynamics.component";
import { MarketDynamicsSampleOutputComponent } from './components/sample-report-output/market-dynamics/market-dynamics-sample-output.component';
import { MDImpactTableComponent } from './components/sample-report-output/core/md-impact-table/md-impact-table.component';
import { MEListOutputComponent } from './components/sample-report-output/core/me-list/me-list-output.component';
import { GenerateSampleResearchMethodologyComponent } from './components/sample-report/generate-sample-research-methodology/generate-sample-research-methodology.component';
import { CpListOutputComponent } from './components/sample-report-output/core/cp-list-output/cp-list-output.component';
import { RmPieComponent } from './components/sample-report-output/core/rm-pie/rm-pie.component';
import { MarketFactorAnalysisComponent } from './components/sample-report-output/market-factor-analysis/market-factor-analysis.component';
import { SupplyValueChainComponent } from './components/sample-report-output/core/supply-value-chain/supply-value-chain.component';
import { ListOfTablesSampleOutputComponent } from './components/sample-report-output/list-of-tables/list-of-tables-sample-output.component';
import { ListOfFiguresSampleOutputComponent } from './components/sample-report-output/list-of-figures/list-of-figures-sample-output.component';
import { NotesOutputComponent } from './components/sample-report-output/notes-sample-output/notes-output.component';
import { RmPieChartOutputComponent } from './components/sample-report-output/core/rm-pie-chart/rm-pie-chart-output.component';
import {GenerateSampleCompetitiveLandscapeComponent} from "./components/sample-report/generate-sample-competitive-landscape/generate-sample-competitive-landscape.component";
import { DragDropModule } from '@angular/cdk/drag-drop';
import {ModulesSequenceComponent} from "./components/master-report/modules-sequence/modules-sequence.component";
import { TocModulesOutputComponent } from './components/sample-report-output/core/toc-modules/toc-modules-output.component';
import {AppendixComponent} from "./components/appendix/appendix.component";
import {GenerateSampleAppendixComponent} from "./components/sample-report/generate-sample-appendix/generate-sample-appendix.component";
import { CompetitiveLandscapeComponent } from './components/sample-report-output/competitive-landscape/competitive-landscape.component';
import { SampleOutputAppendixComponent } from './components/sample-report-output/sample-output-appendix/sample-output-appendix.component';
import { CustomModuleSampleOutputComponent } from './components/sample-report-output/custom-module/custom-module-sample-output.component';
import { SourceOutputComponent } from './components/sample-report-output/core/source-output/source-output.component';
import { CustomInputComponent } from './components/core/custom-input/custom-input.component';
import { CustomOutputComponent } from './components/sample-report-output/core/custom-output/custom-output.component';
import { SentenceBreakPipe } from './pipes/sentenceBreak.pipe';
import { FormatCustomDataPipe } from './pipes/formatCustomData.pipe';
import { HeaderService } from './services/header.service';
import {AddSubModuleComponent} from "./components/master-report/add-sub-module/add-sub-module.component";
import {OtherSubModuleComponent} from "./components/other-sub-module/other-sub-module.component";
import { SampleTypeMarketStrucutreComponent } from './components/sample-report-output/core/sample-type-market-strucutre/sample-type-market-strucutre.component';
import { SampleOutputService } from './services/sample-output.service';
import { SampleInputService } from './services/sample-input.service';
import { HeadingInputComponent } from './components/core/heading-input/heading-input.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProfileComponent,
    TreeGridComponent,
    SegmentCreationComponent,
    ReportFormComponent,
    RegionCountryFormComponent,
    KvMultiSelectComponent,
    SecondaryResearchInputElementComponent,
    TextInputComponent,
    TableInputComponent,
    ImageInputComponent,
    PieChartInputComponent,
    BarChartInputComponent,
    EditableGridComponent,
    ReportSearchListComponent,
    ReportInfoComponent,
    ReportGlobalInfoComponent,
    MarketDynamicsNewComponent,
    MarketIntroductionNewComponent,
    ExecutiveSummaryNewComponent,
    MarketFactorAnalysisNewComponent,
    CompetitiveLandscapeNewComponent,
    CompanyProfileNewComponent,
    MultiLevelInputComponent,
    IndustryInsightsNewComponent,
    SecondaryResearchInputWrapperComponent,
    SecondaryResearchInputComponent,
    ImportExportTrendsNewComponent,
    MacroIndicatorsNewComponent,
    MarketInsightsNewComponent,
    OilGasSectorOverviewNewComponent,
    PowerSectorOverviewNewComponent,
    ParentMarketAnalysisNewComponent,
    MarketOverviewNewComponent,
    PipelineAnalysisNewComponent,
    RegulatoryLandscapeNewComponent,
    PricingAnalysisNewComponent,
    BrandShareAnalysisNewComponent,
    FutureScenarioNewComponent,
    ProductionOutlookNewComponent,
    TradeLandscapeNewComponent,
    PricingRawMaterialScenarioNewComponent,
    MarDynRatingStrengthComponent,
    CompanySectionsInputComponent,
    CompanySwotAnalysisComponent,
    CompanyFoSectionsComponent,
    CompanyFoSectionNewComponent,
    ProductOfferingComponent,
    PorterInputComponent,
    SupplyChainInputComponent,
    TabulatorGridComponent,
    MeGridSectionComponent,
    MeGridRegionSectionComponent,
    MeGridDataInfoComponent,
    TextTableDataComponent,
    FullReviewReportComponent,
    CpSecondaryElementComponent,
    CpOverviewComponent,
    CpKeyDevelopmentsComponent,
    CpStrategyComponent,
    ListInputComponent,
    OtherModuleComponent,
    SharedDataElementComponent,
    CompetitorDashboardComponent,
    ValueFromKeyPipe,
    StartOnlyWithAlphabetsPipe,
    DeleteCompanyProfileDialog,
    VerifyEmailComponent,
    AdminPanelComponent,
    PorterInputNonTechComponent,
    AdminDashboardComponent,
    InterconnectAdminComponent,
    DuplicateCpComponent,
    AssignUserReportsComponent,
    FeaturedReportsComponent,
    UserReportsComponent,
    UserFeaturedReportsComponent,
    SampleReportComponent,
    SampleExecutiveSummaryComponent,
    CustomTableInputComponent,
    SampleReportOutputComponent,
    BarChartOutputComponent,
    PieChartOutputComponent,
    TableOutputComponent,
    ImageOutputComponent,
    TextOutputComponent,
    CustomTableOutputComponent,
    HeadingOutputComponent,
    TableHeadingOutputComponent,
    SubHeadingOutputComponent,
    FigureHeadingOutputComponent,
    ExecutiveSummarySampleOutputComponent,
    SampleSecondaryOutputComponent,
    MarketIntroductionSampleOutputComponent,
    ResearchMethodologySampleOutputComponent,
    MarketEstimationSampleOutputComponent,
    MarketEstimationSecondaryOutputComponent,
    NonSecondaryTextOutputComponent,
    CompanyProfilesSampleOutputComponent,
    TableOfContentsSampleOutputComponent,
    TocHeadingOutputComponent,
    TableBulletLevelOneComponent,
    TableThOutputComponent,
    METableOutputComponent,
    GenerateSampleMarketIntroductionComponent,
    GenerateSampleMarketDynamicsComponent,
    MarketDynamicsSampleOutputComponent,
    MDImpactTableComponent,
    MEListOutputComponent,
    GenerateSampleResearchMethodologyComponent,
    CpListOutputComponent,
    RmPieComponent,
    MarketFactorAnalysisComponent,
    SupplyValueChainComponent,
    ListOfTablesSampleOutputComponent,
    ListOfFiguresSampleOutputComponent,
    NotesOutputComponent,
    RmPieChartOutputComponent,
    GenerateSampleCompetitiveLandscapeComponent,
    ModulesSequenceComponent,
    TocModulesOutputComponent,
    AppendixComponent,
    GenerateSampleAppendixComponent,
    CompetitiveLandscapeComponent,
    SampleOutputAppendixComponent,
    CustomModuleSampleOutputComponent,
    SourceOutputComponent,
    CustomInputComponent,
    CustomOutputComponent,
    SentenceBreakPipe,
    FormatCustomDataPipe,
    AddSubModuleComponent,
    OtherSubModuleComponent,
    SampleTypeMarketStrucutreComponent,
    HeadingInputComponent,
    DocumentListComponent,
    DocumentUploadComponent
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxEditorModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
    MultidatepickerModule,
    ChartsModule,
    Ng4LoadingSpinnerModule.forRoot(),
    QuillModule.forRoot(),
    TabsModule.forRoot(),
    NgxSpinnerModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      progressBar: true
    }),
    MatAutocompleteModule,
    MatCheckboxModule,
    PapaParseModule,
    ScrollingModule,
    MatChipsModule,
    DragDropModule
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    LocalStorageService,
    AuthGuardService,
    UserService,
    ReportService,
    ReportMetadataService,
    ReportSectionService,
    CompanyProfileService,
    GeoDataService,
    SupplyChainApiService,
    SupplyChainOperationService,
    PortersOperationService,
    PortersApiService,
    PathApiService,
    PathOperationService,
    CompetitiveDashboardServiceApi,
    SharedSampleTocService,
    HeaderService,
    SampleOutputService,
    SampleInputService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    TextInputComponent,
    TableInputComponent,
    ImageInputComponent,
    PieChartInputComponent,
    BarChartInputComponent,
    EditableGridComponent,
    MarDynRatingStrengthComponent,
    ListInputComponent,
    DeleteCompanyProfileDialog,
    UserReportsComponent,
    UserFeaturedReportsComponent,
    CustomTableInputComponent,
    ModulesSequenceComponent,
    CustomInputComponent,
    AddSubModuleComponent,
    HeadingInputComponent
  ]
})
export class AppModule { }
