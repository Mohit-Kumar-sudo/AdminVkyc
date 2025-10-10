import { Component, ViewChild, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../services/api/api.service';
import { ActivatedRoute } from '@angular/router';
import * as QRCode from 'qrcode';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent implements OnInit {
  certificateId: string = '';
  isLoading: boolean = false;
  isLoadingCertificates: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  viewingCertificate: any = null;
  allCertificates: any[] = [];
  filteredCertificates: any[] = [];
  searchTerm: string = '';
  qrCodeDataUrl: string = '';
  isDownloading: boolean = false;

  @ViewChild('viewCertificateModal') viewCertificateModal: any;

  constructor(
    private apiService: ApiService,
    private modalService: NgbModal,
    private route: ActivatedRoute
  ) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  ngOnInit() {
    this.loadAllCertificates();
    
    // Auto-verify when cert parameter is in URL
    this.route.queryParams.subscribe(params => {
      if (params['cert']) {
        this.certificateId = params['cert'];
        // Wait a bit for certificates to load, then verify
        setTimeout(() => {
          this.verifyCertificate();
        }, 500);
      }
    });
  }

  // Load all certificates when component initializes
  loadAllCertificates() {
    this.isLoadingCertificates = true;
    this.apiService.get('certificates/public', {}).subscribe(
      (response) => {
        this.isLoadingCertificates = false;
        if (response && response.success) {
          this.allCertificates = response.data || [];
          this.filteredCertificates = this.allCertificates;
          this.successMessage = `Loaded ${this.allCertificates.length} certificates`;
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = 'Failed to load certificates';
        }
      },
      (error) => {
        this.isLoadingCertificates = false;
        console.error('Error loading certificates:', error);
        this.errorMessage = 'Failed to load certificates list';
      }
    );
  }

  verifyCertificate() {
    const trimmedId = this.certificateId?.toString().trim();
    if (!trimmedId) {
      this.errorMessage = 'Please enter a certificate ID';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Debug: show what's in memory (helps confirm why not found)
    console.log('Verifying certificate id:', { trimmedId, loadedCount: this.allCertificates.length });
    // Optional: show a small sample of ids for debugging
    console.log('Loaded IDs sample:', this.allCertificates.slice(0,10).map(c => c.certification_id));

    // More tolerant match: toString + toLowerCase + null-safe
    const foundCertificate = this.allCertificates.find(cert => {
      const id = cert?.certification_id ?? cert?.certificationId ?? '';
      return id?.toString().trim().toLowerCase() === trimmedId.toLowerCase();
    });

    if (foundCertificate) {
      this.isLoading = false;
      // open modal directly using the found object
      this.openViewModal(foundCertificate);
      return;
    }

    // Not found in preloaded list -> call API (still defensive)
    this.apiService.getById(`get/${trimmedId}`, trimmedId).subscribe(
      (response) => {
        this.isLoading = false;
        if (response && response.success && response.data) {
          const certificate = response.data;
          if (certificate.status === 'active') {
            this.openViewModal(certificate);
          } else {
            this.errorMessage = `Certificate found but status is: ${certificate.status}. Only active certificates can be verified.`;
          }
        } else {
          this.errorMessage = 'Certificate not found or invalid certificate ID';
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error verifying certificate:', error);

        // If backend returns 500 it's a server-side error; show friendly message
        if (error?.status === 404) {
          this.errorMessage = 'Certificate not found. Please check the certificate ID and try again.';
        } else if (error?.status === 500) {
          // Provide info to help triage: 500 likely backend bug for that endpoint
          this.errorMessage = 'An error occurred on the server while verifying the certificate. If the certificate exists in the list above, try selecting it from there. (Server returned 500)';
        } else {
          this.errorMessage = 'An error occurred while verifying the certificate. Please try again.';
        }
      }
    );
  }

  // Search through preloaded certificates
  searchCertificates() {
    const term = this.searchTerm?.toString().trim().toLowerCase();
    if (!term) {
      this.filteredCertificates = this.allCertificates;
      return;
    }

    this.filteredCertificates = this.allCertificates.filter(cert => {
      // make all fields safe toString comparisons
      const id = (cert?.certification_id ?? cert?.certificationId ?? '').toString().toLowerCase();
      const first = (cert?.['First Name'] ?? cert?.firstName ?? '').toString().toLowerCase();
      const last = (cert?.['Last Name'] ?? cert?.lastName ?? '').toString().toLowerCase();
      const course = (cert?.['Course Title'] ?? cert?.courseTitle ?? '').toString().toLowerCase();

      return id.includes(term) || first.includes(term) || last.includes(term) || course.includes(term);
    });
  }

  async generateQRCode(certificationId: string): Promise<string> {
    if (!certificationId || certificationId === 'PENDING') {
      // Return empty string for pending certificates
      return '';
    }
    
    try {
      const verificationUrl = `${window.location.origin}/certificate?cert=${certificationId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 160,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  }

  // Quick select from the list
  selectCertificate(certificate: any) {
    // directly open modal (no need to re-verify via API if we have the object)
    if (!certificate) return;
    this.certificateId = certificate.certification_id ?? certificate.certificationId ?? '';
    this.searchTerm = '';
    this.filteredCertificates = this.allCertificates;
    // Open modal directly using the selected certificate (skip redundant API call)
    this.openViewModal(certificate);
  }

  async openViewModal(certificate: any) {
    this.viewingCertificate = certificate;
    
    // Generate QR code if we're in browser
    if (this.isBrowser()) {
      this.qrCodeDataUrl = await this.generateQRCode(certificate.certification_id);
    }
    
    this.modalService.open(this.viewCertificateModal, { 
      ariaLabelledBy: 'modal-basic-title', 
      size: 'xl',
      windowClass: 'certificate-modal',
      backdrop: 'static'
    });
  }

  formatCertificationDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  printCertificate() {
    if (!this.isBrowser()) return;

    const printContent = document.querySelector('.certificate-preview');
    if (printContent) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Certificate</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;1,400&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Montserrat', sans-serif; }
          body { background: white; }
          .cert-container { position: relative; padding: 45px; border: 1px solid #6f6f6f; width: 1056px; height: 816px; margin: auto; }
          .border-gray { padding: 5px; border: 3px solid #58595B; }
          .border-red { border: 3px double #CE202F; }
          .content { padding: 20px; height: 700px; text-align: center; }
          .credentials { position: absolute; right: 100px; top: 120px; color: #58595B; list-style-type: none; font-size: 9pt; font-weight: 300; text-align: right; }
          .copytext-container { position: absolute; left: 114px; top: 275px; text-align: left; line-height: 100%; }
          .congrats-copytext { margin-bottom: 70px; }
          .course-copytext { margin-bottom: 65px; }
          .address-copytext { line-height: 150%; }
          #mt-logo { position: absolute; width: 350px; right: 777px; top: 91px; }
          #mt-stamp { position: absolute; width: 144px; right: 130px; top: 550px; }
          #mt-stamp-sign { position: absolute; width: 144px; right: 85px; top: 550px; }
          #mt-site { color: #CE202F; font-size: 14pt; }
          #user-id-string, #course-id-string { line-height: 7px; }
          h2, h3 { font-weight: 300; }
          address { font-weight: 100; font-size: 14pt; font-style: normal; line-height: 135%; }
          #qrcode-container { float: right; margin-top: 20px; }
          #certificate-qrcode { width: 160px; height: 160px; border: 2px solid #58595B; }
          #certificate-qrcode img { width: 100%; height: 100%; display: block; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
      }
    }
  }

  async downloadCertificate() {
    if (!this.isBrowser() || !this.viewingCertificate) {
      console.error('Cannot download certificate: Not in browser environment or no certificate loaded');
      return;
    }

    this.isDownloading = true;

    try {
      await this.generateCertificateImage();
    } catch (error) {
      console.error('Error generating certificate image:', error);
      this.errorMessage = 'Failed to generate certificate. Please try again.';
      
      // Clear error after 5 seconds
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    } finally {
      this.isDownloading = false;
    }
  }

private async generateCertificateImage() {
  // Wait a bit for any animations or rendering to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  const certificateElement = document.querySelector('.certificate-preview') as HTMLElement;
  
  if (!certificateElement) {
    throw new Error('Certificate element not found');
  }

  try {
    // Capture the certificate as high-quality image using correct html2canvas options
    const canvas = await html2canvas(certificateElement, {
      useCORS: true,
      allowTaint: false,
      background: '#ffffff', // Changed from 'background'
      logging: false,
      width: certificateElement.scrollWidth,
      height: certificateElement.scrollHeight,
      scale: 2,
    }as any);

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Create a temporary link to download the image as PNG
    const link = document.createElement('a');
    link.download = `Certificate_${this.viewingCertificate.certification_id || 'PENDING'}_${this.viewingCertificate['First Name']}_${this.viewingCertificate['Last Name']}.png`;
    link.href = imgData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('Error in generateCertificateImage:', error);
    throw error;
  }
}

// Alternative method with even higher quality
private async generateCertificateUltraQuality() {
  await new Promise(resolve => setTimeout(resolve, 500));

  const certificateElement = document.querySelector('.certificate-preview') as HTMLElement;
  
  if (!certificateElement) {
    throw new Error('Certificate element not found');
  }

  try {
    // Ultra quality with scaling in onclone
    const canvas = await html2canvas(certificateElement, {
      useCORS: true,
      allowTaint: false,
      background: '#ffffff',
      logging: false,
      width: certificateElement.scrollWidth,
      height: certificateElement.scrollHeight,
      scale: 2,
    } as any);

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    const link = document.createElement('a');
    link.download = `Certificate_${this.viewingCertificate.certification_id || 'PENDING'}_${this.viewingCertificate['First Name']}_${this.viewingCertificate['Last Name']}.png`;
    link.href = imgData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
}

  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.verifyCertificate();
    }
  }

  clearError() {
    this.errorMessage = '';
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredCertificates = this.allCertificates;
  }
}