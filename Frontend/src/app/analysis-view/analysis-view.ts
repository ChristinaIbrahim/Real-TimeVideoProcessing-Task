import { VideoSocket } from './../Service/video-socket';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-analysis-view',
  imports: [],
  templateUrl: './analysis-view.html',
  styleUrls: ['./analysis-view.css'],
})
export class AnalysisView implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('liveVideo', { static: false }) liveVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('leftCanvas', { static: false }) leftCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('processedCanvas', { static: false }) processedCanvas!: ElementRef<HTMLCanvasElement>;

  private captureCanvas!: HTMLCanvasElement;
  private captureCtx!: CanvasRenderingContext2D | null;
  private Timer: any;
  frameNum = 0;
  fps = 10;

  constructor(private socket: VideoSocket) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.startCamera();
    this.socket.on('processed', (data: any) => {
      this.onProcessed({
        image_b64: data.image_b64 || data,
        frameNum: data.frameNum || this.frameNum,
        points: data.points || [],
        serverTs: data.serverTs || Date.now(),
      });
    });
  }

  ngOnDestroy(): void {
    if (this.Timer) clearTimeout(this.Timer);
    this.stopCamera();
    this.socket.disconnect();
  }

  async startCamera() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      console.warn('Camera not available');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.liveVideo.nativeElement.srcObject = stream;
      await this.liveVideo.nativeElement.play();

      const w = this.liveVideo.nativeElement.videoWidth || 640;
      const h = this.liveVideo.nativeElement.videoHeight || 480;

      this.captureCanvas = document.createElement('canvas');
      this.captureCanvas.width = w;
      this.captureCanvas.height = h;
      this.captureCtx = this.captureCanvas.getContext('2d');

      this.leftCanvas.nativeElement.width = w;
      this.leftCanvas.nativeElement.height = h;
      this.processedCanvas.nativeElement.width = w;
      this.processedCanvas.nativeElement.height = h;

      this.captureLoop();
    } catch (err) {
      console.error('Camera not start', err);
    }
  }

  stopCamera() {
    const videoEl = this.liveVideo?.nativeElement;
    if (!videoEl) return;

    const stream = videoEl.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    videoEl.srcObject = null;
  }

  captureLoop() {
    if (!this.captureCtx) return;
    this.frameNum++;
    this.captureCtx.drawImage(
      this.liveVideo.nativeElement,
      0,
      0,
      this.captureCanvas.width,
      this.captureCanvas.height
    );

    this.captureCanvas.toBlob(async (blob) => {
      if (!blob) return;

      const arrBuf = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrBuf);

      this.socket.emit('frame', {
        frameNum: this.frameNum,
        clientTs: Date.now(),
        buf: bytes
      });
    }, 'image/jpeg', 0.7);

    const leftCtx = this.leftCanvas.nativeElement.getContext('2d');
    if (leftCtx) {
      leftCtx.clearRect(0, 0, this.leftCanvas.nativeElement.width, this.leftCanvas.nativeElement.height);
      leftCtx.drawImage(this.captureCanvas, 0, 0);
      leftCtx.fillStyle = 'white';
      leftCtx.font = '18px Arial';
      leftCtx.fillText(`frame num: ${this.frameNum}`, 10, 22);
    }

    const frameDuration = Math.round(1000 / this.fps);
    this.Timer = setTimeout(() => this.captureLoop(), frameDuration);
  }

  onProcessed(payload: { image_b64: string; frameNum: number; points?: number[][]; serverTs?: number }) {
    const ctx = this.processedCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = payload.image_b64.startsWith('data:image')
      ? payload.image_b64
      : 'data:image/jpeg;base64,' + payload.image_b64;

    img.onload = () => {
      ctx.clearRect(0, 0, this.processedCanvas.nativeElement.width, this.processedCanvas.nativeElement.height);
      ctx.drawImage(img, 0, 0, this.processedCanvas.nativeElement.width, this.processedCanvas.nativeElement.height);

      const pts = payload.points;
      if (pts && pts.length) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = 'white';
      ctx.font = '18px Arial';
      ctx.fillText(`frame num: ${payload.frameNum}`, 10, 22);

      const now = Date.now();
      const delay = now - (payload.serverTs || now);
      ctx.fillText(`delay ms: ${delay}`, 10, 44);
    };
  }
}
