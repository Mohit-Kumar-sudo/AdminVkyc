import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/shared/home/home.component';
import { LoginComponent } from './components/user/login/login.component';
import { RegisterComponent } from './components/user/register/register.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { AuthGuardService as AuthGuard } from './services/guards/auth-guard.service';
import { SignUpInGuardService as LoginGuard } from './services/guards/signUpInGuard.service';
import { ReportFormComponent } from './components/master-report/report-form/report-form.component';
import { RegionCountryFormComponent } from './components/market-estimation/region-country-form/region-country-form.component';
import { SegmentCreationComponent } from './components/market-estimation/segment-creation/segment-creation.component';
import { ReportSearchListComponent } from './components/master-report/report-search-list/report-search-list.component';
import { ReportInfoComponent } from './components/master-report/report-info/report-info.component';
import { ReportGlobalInfoComponent } from './components/master-report/report-global-info/report-global-info.component';
import { MarketIntroductionNewComponent } from './components/market-introduction/market-introduction-new/market-introduction-new.component';
import { ExecutiveSummaryNewComponent } from './components/executive-summary/executive-summary-new/executive-summary-new.component';
import { MarketDynamicsNewComponent } from './components/market-dynamics/market-dynamics-new/market-dynamics-new.component';
import { MarketFactorAnalysisNewComponent } from './components/market-factor-analysis/market-factor-analysis-new/market-factor-analysis-new.component';
import { CompetitiveLandscapeNewComponent } from './components/competitive-landscape/competitive-landscape-new/competitive-landscape-new.component';
import { CompanyProfileNewComponent } from './components/company-profile/company-profile-new/company-profile-new.component';
import { MultiLevelInputComponent } from './components/market-dynamics/multi-level-input/multi-level-input.component';
import { IndustryInsightsNewComponent } from './components/industry-insights/industry-insights-new/industry-insights-new.component';
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
import { FutureScenarioNewComponent } from './components/future-scenario/future-scenario-new/future-scenario-new.component';
import { BrandShareAnalysisNewComponent } from './components/brand-share-analysis/brand-share-analysis-new/brand-share-analysis-new.component';
import { TradeLandscapeNewComponent } from './components/trade-landscape/trade-landscape-new/trade-landscape-new.component';
import { ProductionOutlookNewComponent } from './components/production-outlook/production-outlook-new/production-outlook-new.component';
import { PricingRawMaterialScenarioNewComponent } from './components/pricing-raw-material-scenario/pricing-raw-material-scenario-new/pricing-raw-material-scenario-new.component';
import { CompanySectionsInputComponent } from './components/company-profile/company-sections-input/company-sections-input.component';
import { CompanySwotAnalysisComponent } from './components/company-profile/company-swot-analysis/company-swot-analysis.component';
import { CompanyFoSectionsComponent } from './components/company-profile/company-fo-sections/company-fo-sections.component';
import { ProductOfferingComponent } from './components/company-profile/product-offering/product-offering.component';
import { CompanyFoSectionNewComponent } from './components/company-profile/company-fo-sections/company-fo-section-new/company-fo-section-new.component';
import { PorterInputComponent } from './components/market-factor-analysis/porter-input/porter-input.component';
import { SupplyChainInputComponent } from './components/market-factor-analysis/supply-chain-input/supply-chain-input.component';
import { TabulatorGridComponent } from './components/market-estimation/tabulator-grid/tabulator-grid.component';
import { MeGridSectionComponent } from './components/market-estimation/me-grid-section/me-grid-section.component';
import { MeGridRegionSectionComponent } from './components/market-estimation/me-grid-region-section/me-grid-region-section.component';
import { MeGridDataInfoComponent } from './components/market-estimation/me-grid-data-info/me-grid-data-info.component';
import { FullReviewReportComponent } from './components/full-review-report/full-review-report.component';
import { CpStrategyComponent } from './components/company-profile/cp-strategy/cp-strategy.component';
import { CpKeyDevelopmentsComponent } from './components/company-profile/cp-key-developments/cp-key-developments.component';
import { CpOverviewComponent } from './components/company-profile/cp-overview/cp-overview.component';
import { OtherModuleComponent } from './components/other-module/other-module.component';
import { CompetitorDashboardComponent } from './components/competitor-dashboard/competitor-dashboard.component';
import { VerifyEmailComponent } from './components/user/verify-email/verify-email.component';
import { AdminPanelComponent } from './administrator/admin-panel/admin-panel.component';
import { AdminGuardService as AdminGuard } from './services/guards/admin-guard.service';
import { PorterInputNonTechComponent } from './components/market-factor-analysis/porter-input-nontech/porter-input-nontech.component';
import { AdminDashboardComponent } from './administrator/admin-dashboard/admin-dashboard.component';
import { InterconnectAdminComponent } from './administrator/interconnect-admin/interconnect-admin.component';
import { DuplicateCpComponent } from './components/duplicate-cp/duplicate-cp.component';
import {AssignUserReportsComponent} from "./administrator/assign-user-reports/assign-user-reports.component";
import {FeaturedReportsComponent} from "./administrator/featured-reports/featured-reports.component";
import { SampleReportComponent } from './components/sample-report/sample-report.component';
import { SampleExecutiveSummaryComponent } from './components/sample-report/executive-summary/sample-executive-summary.component';
import { SampleReportOutputComponent } from './components/sample-report-output/sample-report-output.component';
import {GenerateSampleMarketIntroductionComponent} from "./components/sample-report/generate-sample-market-introduction/generate-sample-market-introduction.component";
import {GenerateSampleMarketDynamicsComponent} from "./components/sample-report/generate-sample-market-dynamics/generate-sample-market-dynamics.component";
import { GenerateSampleResearchMethodologyComponent } from './components/sample-report/generate-sample-research-methodology/generate-sample-research-methodology.component';
import {GenerateSampleCompetitiveLandscapeComponent} from "./components/sample-report/generate-sample-competitive-landscape/generate-sample-competitive-landscape.component";
import {AppendixComponent} from "./components/appendix/appendix.component";
import {GenerateSampleAppendixComponent} from "./components/sample-report/generate-sample-appendix/generate-sample-appendix.component";
import {OtherSubModuleComponent} from "./components/other-sub-module/other-sub-module.component";
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { DocumentListComponent } from './components/document-list/document-list.component';

const ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [LoginGuard]
  },

  // Protected
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },

  // Master Report
  {
    path: 'me-report',
    component: ReportSearchListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'full-review-report',
    component: FullReviewReportComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/new',
    component: ReportFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/view',
    component: ReportInfoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info',
    component: ReportGlobalInfoComponent,
    canActivate: [AuthGuard]
  },

  // ME Section
  {
    path: 'me-report/:id/global-info/market-estimation',
    component: RegionCountryFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/appendix',
    component: AppendixComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/market-estimation/segment-creation',
    component: SegmentCreationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/market-estimation/me-grid',
    component: TabulatorGridComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/market-estimation/me-grid-section',
    component: MeGridSectionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/market-estimation/me-grid-region-section',
    component: MeGridRegionSectionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/market-estimation/me-grid-data-info',
    component: MeGridDataInfoComponent,
    canActivate: [AuthGuard]
  },
  // Market Executive Summary
  {
    path: 'me-report/:id/global-info/executive-summary',
    component: ExecutiveSummaryNewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/other-sub-module',
    component: OtherSubModuleComponent,
    canActivate: [AuthGuard]
  },
  // Market Introduction
  {
    path: 'me-report/:id/global-info/market-introduction',
    component: MarketIntroductionNewComponent,
    canActivate: [AuthGuard]
  },

  // Market Dynamics
  {
    path: 'me-report/:id/global-info/market-dynamics',
    component: MarketDynamicsNewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/market-dynamics/multi-level-input',
    component: MultiLevelInputComponent,
    canActivate: [AuthGuard]
  },

  // Market Factor Analysis
  {
    path: 'me-report/:id/global-info/market-factor-analysis',
    component: MarketFactorAnalysisNewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/market-factor-analysis/porter',
    component: PorterInputComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/market-factor-analysis/supply-chain',
    component: SupplyChainInputComponent,
    canActivate: [AuthGuard]
  },

  // Competitive Landscape
  {
    path: 'me-report/:id/global-info/competitive-landscape',
    component: CompetitiveLandscapeNewComponent,
    canActivate: [AuthGuard]
  },

  // Company Profile
  {
    path: 'me-report/:id/global-info/company-profile',
    component: CompanyProfileNewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/company-profile/company-sections',
    component: CompanySectionsInputComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/company-profile/company-sections/fo-sections',
    component: CompanyFoSectionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/company-profile/company-sections/fo-sections/:fo-sec',
    component: CompanyFoSectionNewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/company-profile/company-sections/product-offering',
    component: ProductOfferingComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/company-profile/company-sections/swot-analysis',
    component: CompanySwotAnalysisComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/company-profile/company-sections/company-overview',
    component: CpOverviewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/company-profile/company-sections/key-developments',
    component: CpKeyDevelopmentsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'me-report/:id/global-info/company-profile/company-sections/strategy',
    component: CpStrategyComponent,
    canActivate: [AuthGuard]
  },

  // Pricing and Raw material
  {
    path: 'me-report/:id/global-info/pricing-raw-material',
    component: PricingRawMaterialScenarioNewComponent,
    canActivate: [AuthGuard]
  },

  // Trade Landscape
  {
    path: 'me-report/:id/global-info/trade-landscape',
    component: TradeLandscapeNewComponent,
    canActivate: [AuthGuard]
  },

  // Production Outlook
  {
    path: 'me-report/:id/global-info/production-outlook',
    component: ProductionOutlookNewComponent,
    canActivate: [AuthGuard]
  },

  // Future Scenario
  {
    path: 'me-report/:id/global-info/future-scenario',
    component: FutureScenarioNewComponent,
    canActivate: [AuthGuard]
  },

  // Brand Share Analysis
  {
    path: 'me-report/:id/global-info/brand-share-analysis',
    component: BrandShareAnalysisNewComponent,
    canActivate: [AuthGuard]
  },

  // Pricing Analysis
  {
    path: 'me-report/:id/global-info/pricing-analysis',
    component: PricingAnalysisNewComponent,
    canActivate: [AuthGuard]
  },

  // Pipeline Analysis
  {
    path: 'me-report/:id/global-info/pipeline-analysis',
    component: PipelineAnalysisNewComponent,
    canActivate: [AuthGuard]
  },

  // Regulatory Landscape
  {
    path: 'me-report/:id/global-info/regulatory-landscape',
    component: RegulatoryLandscapeNewComponent,
    canActivate: [AuthGuard]
  },

  // Market Overview
  {
    path: 'me-report/:id/global-info/market-overview',
    component: MarketOverviewNewComponent,
    canActivate: [AuthGuard]
  },

  // Parent Market Analysis
  {
    path: 'me-report/:id/global-info/parent-market-analysis',
    component: ParentMarketAnalysisNewComponent,
    canActivate: [AuthGuard]
  },

  // Power sector overview
  {
    path: 'me-report/:id/global-info/power-sector-overview',
    component: PowerSectorOverviewNewComponent,
    canActivate: [AuthGuard]
  },

  // Oil Gas sector Overview
  {
    path: 'me-report/:id/global-info/oil-gas-overview',
    component: OilGasSectorOverviewNewComponent,
    canActivate: [AuthGuard]
  },

  // Market Insights
  {
    path: 'me-report/:id/global-info/market-insights',
    component: MarketInsightsNewComponent,
    canActivate: [AuthGuard]
  },

  // Macro Indicators
  {
    path: 'me-report/:id/global-info/macro-indicators',
    component: MacroIndicatorsNewComponent,
    canActivate: [AuthGuard]
  },

  // Import export trends
  {
    path: 'me-report/:id/global-info/import-export-trends',
    component: ImportExportTrendsNewComponent,
    canActivate: [AuthGuard]
  },

  // Industry Insights
  {
    path: 'me-report/:id/global-info/industry-insights',
    component: IndustryInsightsNewComponent,
    canActivate: [AuthGuard]
  },

  // Other Module
  {
    path: 'me-report/:id/global-info/other-module',
    component: OtherModuleComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'secondary-input',
    component: SecondaryResearchInputComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'competitor',
    component: CompetitorDashboardComponent
  },
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'verify-email/:id',
    component: VerifyEmailComponent
  },
  {
    path: 'admin-panel',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'user-confirm',
    component: AdminPanelComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'interconnect-csv',
    component: InterconnectAdminComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'me-report/:id/global-info/market-factor-analysis/porter-nontech',
    component: PorterInputNonTechComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'duplicate_cps',
    component: DuplicateCpComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/assign-user-reports',
    component: AssignUserReportsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/featured-reports',
    component: FeaturedReportsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sample-report/:id/view',
    component: SampleReportComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sample-report/:id/executive-summary',
    component: SampleExecutiveSummaryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sample-report-output/:id',
    component: SampleReportOutputComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sample-report/:id/market-introduction',
    component: GenerateSampleMarketIntroductionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sample-report/:id/market-dynamics',
    component: GenerateSampleMarketDynamicsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sample-report/:id/other-module',
    component: GenerateSampleResearchMethodologyComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sample-report/:id/competitive-landscape',
    component: GenerateSampleCompetitiveLandscapeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sample-report/:id/appendix',
    component: GenerateSampleAppendixComponent,
    canActivate: [AuthGuard]
  },
  { path: 'document', 
    component: DocumentUploadComponent,
    canActivate: [AuthGuard]
  },
  { path: 'documentsList', 
    component: DocumentListComponent,
    canActivate: [AuthGuard] 
  }

];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
