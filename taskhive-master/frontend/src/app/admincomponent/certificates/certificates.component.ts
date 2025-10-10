import { Component, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../services/api/api.service';
import { FileService } from '../../services/file/file.service';
import { environment } from '../../../environments/environment';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.scss'
})
export class CertificatesComponent {
  p: number = 1;
  itemsPerPage: number = 10;
  env: any;
  selectedCertificate: any = {}; 
  getData: any[] = [];  
  pagination: any = null;
  coursesData: any = []; // For course dropdown
  addForm!: FormGroup;
  editForm!: FormGroup;
  certificateToDeleteId: string | null = null;  
  showAddForm: boolean = false;
  editingCertificate: any = null;
  viewingCertificate: any = null;
  Math = Math; // Make Math accessible in template
  qrCodeDataUrl: string = ''; // Store QR code data URL
  signatureImageBase64: string = '';
  logoImageBase64: string = '';

  // Server and LMS options
  serverOptions = [
    { value: 'SERVER001', label: 'Main Production Server (SERVER001)' },
    { value: 'SERVER002', label: 'Backup Server (SERVER002)' },
    { value: 'SERVER003', label: 'Development Server (SERVER003)' }
  ];

  lmsOptions = [
    { value: 'LMS_MOODLE_001', label: 'Moodle Primary (LMS_MOODLE_001)' },
    { value: 'LMS_CANVAS_001', label: 'Canvas Learning (LMS_CANVAS_001)' },
    { value: 'LMS_CUSTOM_001', label: 'Custom LMS (LMS_CUSTOM_001)' }
  ];

  courseOptions = [
    { id: 'COURSE000', title: 'Data Analytics', code: 'DA101' },
    { id: 'COURSE001', title: 'Web Development Fundamentals', code: 'WEB101' },
    { id: 'COURSE002', title: 'React.js Advanced', code: 'REACT201' },
    { id: 'COURSE003', title: 'Node.js Backend Development', code: 'NODE301' },
    { id: 'COURSE004', title: 'Full Stack JavaScript', code: 'FULLJS401' },
    { id: 'COURSE005', title: 'Python Programming', code: 'PY101' },
    { id: 'COURSE006', title: 'Data Science with Python', code: 'DS201' },
    { id: 'COURSE007', title: 'Machine Learning Basics', code: 'ML101' },
    { id: 'COURSE008', title: 'Digital Marketing', code: 'DM101' }
  ];

  @ViewChild('confirmDeleteModal') confirmDeleteModal: any;
  @ViewChild('addCertificateModal') addCertificateModal: any;
  @ViewChild('editCertificateModal') editCertificateModal: any;
  @ViewChild('viewCertificateModal') viewCertificateModal: any;

  constructor(
    private apiService: ApiService, 
    private fb: FormBuilder,
    private modalService: NgbModal,
    private fileServ: FileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.env = environment.url;
    this.initializeForms();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.fetchAllCertificates();
  }

  initializeForms() {
    this.addForm = this.fb.group({
      server_id: ['', Validators.required],
      lms_id: ['', Validators.required],
      'First Name': ['', Validators.required],
      'Last Name': ['', Validators.required],
      'Course Title': ['', Validators.required],
      certification_date: ['', Validators.required],
      course_id: ['', Validators.required],
      status: ['active'] // Default to active
    });

    this.editForm = this.fb.group({
      server_id: ['', Validators.required],
      lms_id: ['', Validators.required],
      'First Name': ['', Validators.required],
      'Last Name': ['', Validators.required],
      'Course Title': ['', Validators.required],
      certification_date: ['', Validators.required],
      course_id: ['', Validators.required],
      status: ['active']
    });

    // Watch for course title changes to auto-set course ID
    this.addForm.get('Course Title')?.valueChanges.subscribe(courseTitle => {
      const selectedCourse = this.courseOptions.find(course => course.title === courseTitle);
      if (selectedCourse) {
        this.addForm.patchValue({ course_id: selectedCourse.id }, { emitEvent: false });
      }
    });

    this.editForm.get('Course Title')?.valueChanges.subscribe(courseTitle => {
      const selectedCourse = this.courseOptions.find(course => course.title === courseTitle);
      if (selectedCourse) {
        this.editForm.patchValue({ course_id: selectedCourse.id }, { emitEvent: false });
      }
    });
  }

  // Generate QR Code for certificate verification
  async generateQRCode(certificationId: string): Promise<string> {
    if (!certificationId || certificationId === 'PENDING') {
      // Return a placeholder for pending certificates
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

  private imageToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

  // fetch method
  fetchAllCertificates() {
    this.apiService.get('certificates', {}).subscribe(
      (res: any) => {
        // If your ApiService returns { success, data, pagination } use res.data
        if (res && res.success) {
          this.getData = Array.isArray(res.data) ? res.data : []; // ensure array
          this.pagination = res.pagination ?? null;
        } else if (Array.isArray(res)) {
          // in case ApiService already returns an array directly
          this.getData = res;
          this.pagination = null;
        } else {
          this.getData = [];
        }
        console.log('Certificates data:', this.getData, 'pagination:', this.pagination);
      },
      (err) => {
        console.error('Error fetching certificates', err);
        this.getData = [];
        this.pagination = null;
      }
    );
  }

  getSNo(index: number): number {
    return (this.p - 1) * this.itemsPerPage + index + 1;
  }

  openAddModal() {
    this.showAddForm = true;
    this.addForm.reset();
    this.addForm.patchValue({ status: 'active' }); // Set default status
    this.modalService.open(this.addCertificateModal, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }

  openEditModal(certificate: any) {
    this.editingCertificate = certificate;
    this.editForm.patchValue({
      server_id: certificate.server_id,
      lms_id: certificate.lms_id,
      'First Name': certificate['First Name'],
      'Last Name': certificate['Last Name'],
      'Course Title': certificate['Course Title'],
      certification_date: this.formatDateForInput(certificate.certification_date),
      course_id: certificate.course_id,
      status: certificate.status
    });
    this.modalService.open(this.editCertificateModal, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
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
      windowClass: 'certificate-modal'
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  formatDisplayDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  onAddSubmit() {
    if (this.addForm.valid) {
      const formData = { ...this.addForm.value };
      formData.certification_date = new Date(formData.certification_date).toISOString();
      
      this.apiService.post('certificates', formData).subscribe(
        res => {
          console.log('Certificate created:', res);
          this.fetchAllCertificates();
          this.modalService.dismissAll();
          this.addForm.reset();
        },
        error => {
          console.error('Error creating certificate:', error);
        }
      );
    } else {
      this.markFormGroupTouched(this.addForm);
    }
  }

  onEditSubmit() {
    if (this.editForm.valid && this.editingCertificate) {
      const formData = { ...this.editForm.value };
      formData.certification_date = new Date(formData.certification_date).toISOString();
      
      this.apiService.put('certificates', this.editingCertificate._id, formData).subscribe(
        res => {
          console.log('Certificate updated:', res);
          this.fetchAllCertificates();
          this.modalService.dismissAll();
          this.editingCertificate = null;
        },
        error => {
          console.error('Error updating certificate:', error);
        }
      );
    } else {
      this.markFormGroupTouched(this.editForm);
    }
  }

  onDelete(id: any) {
    this.certificateToDeleteId = id;  
    const modalRef = this.modalService.open(this.confirmDeleteModal, { ariaLabelledBy: 'modal-basic-title' });
    modalRef.result.then((result) => {
      if (result === 'Delete' && this.certificateToDeleteId) {
        this.apiService.delete('certificates', this.certificateToDeleteId).subscribe(
          res => {
            console.log('Certificate deleted:', res);
            this.fetchAllCertificates();
            this.certificateToDeleteId = null;
          },
          error => {
            console.error('Error deleting certificate:', error);
          }
        );
      }
    });
  }

  confirmDelete(modal: any) {
    modal.close('Delete'); 
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string, form: FormGroup): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string, form: FormGroup): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
    }
    return '';
  }

  async printCertificate() {
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
        #certificate-qrcode img { width: 160px; height: 160px; display: block; }
        @media print { body { margin: 0; } }
      `);
      printWindow.document.write('</style></head><body>');
      
      // Clone the content and replace images with base64
      const clonedContent = printContent.cloneNode(true) as HTMLElement;
      
      // Replace logo
      const logoImg = clonedContent.querySelector('#mt-logo') as HTMLImageElement;
      if (logoImg && this.logoImageBase64) {
        logoImg.src = this.logoImageBase64;
      }
      
      // Replace signature
      const signImg = clonedContent.querySelector('#mt-stamp-sign') as HTMLImageElement;
      if (signImg && this.signatureImageBase64) {
        signImg.src = this.signatureImageBase64;
      }
      
      printWindow.document.write(clonedContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      
      // Wait for images to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500); // Increased timeout for image loading
      };
    }
  }
}

  async downloadCertificate() {
    if (!this.isBrowser()) return;

    // You can implement PDF download using jsPDF and html2canvas
    // For now, this is a placeholder
    console.log('Download certificate functionality - implement with jsPDF or html2canvas');
    
    // Example implementation:
    // import html2canvas from 'html2canvas';
    // import { jsPDF } from 'jspdf';
    // 
    // const element = document.querySelector('.certificate-preview') as HTMLElement;
    // if (element) {
    //   const canvas = await html2canvas(element, { scale: 2 });
    //   const imgData = canvas.toDataURL('image/png');
    //   const pdf = new jsPDF('l', 'mm', 'a4');
    //   const imgWidth = 297;
    //   const imgHeight = (canvas.height * imgWidth) / canvas.width;
    //   pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    //   pdf.save(`certificate_${this.viewingCertificate.certification_id}.pdf`);
    // }
  }
}