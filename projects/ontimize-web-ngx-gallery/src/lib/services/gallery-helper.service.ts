import { Injectable, ElementRef, Renderer2 } from '@angular/core';
import { Util } from '../util/util';

@Injectable()
export class GalleryHelperService {

  private swipeHandlers: Map<string, Function[]> = new Map<string, Function[]>();

  constructor(private renderer: Renderer2) { }

  manageSwipe(status: boolean, element: ElementRef, id: string, nextHandler: Function, prevHandler: Function): void {

    const handlers = this.getSwipeHandlers(id);

    // swipeleft and swiperight are available only if hammerjs is included
    try {
      if (status && !handlers) {
        this.swipeHandlers.set(id, [
          this.renderer.listen(element.nativeElement, 'swipeleft', () => nextHandler()),
          this.renderer.listen(element.nativeElement, 'swiperight', () => prevHandler())
        ]);
      } else if (!status && handlers) {
        handlers.forEach((handler) => handler());
        this.removeSwipeHandlers(id);
      }
    } catch (e) { }
  }

  validateUrl(url: string): string {
    if (url.replace) {
      return url.replace("/ /g", '%20')
        .replace("/\, g", '%27');
    } else {
      return url;
    }
  }

  getBackgroundUrl(image: string) {
    return 'url(\'' + this.validateUrl(image) + '\')';
  }

  private getSwipeHandlers(id: string): Function[] | undefined {
    return this.swipeHandlers.get(id);
  }

  private removeSwipeHandlers(id: string): void {
    this.swipeHandlers.delete(id);
  }

  getFileType(fileSource: string): string {
    //First we check if the filesouce starts with data:
    if (!Util.isUrl(fileSource)) {
      this.getFileTypeByMime(fileSource);
    }

    try {
      let url: URL;
      if (Util.isUrlAbsolute(fileSource)) {
        url = new URL(fileSource);
      } else {
        url = new URL(fileSource, document.baseURI);
      }

      if (url == undefined) {
        return 'unknown';
      } else {
        return this.getFileTypeByURL(url);
      }

    } catch (error) {
      console.warn("Impossible to parse file source url");
    }
    return 'unknown';
  }

  /**
   * Gets file type by mime
   * @param fileSource
   * @returns file type by mime
   */
  getFileTypeByMime(fileSource: string): string {
    //We get the mimeType and check that it is a valid type
    let mimeType = Util.getMimeType(fileSource);
    if (mimeType != undefined) {
      switch (mimeType.split("/")[0]) {
        case 'image': return 'image';
        case 'video': return 'video';
        default: return 'unknown';
      }
    } else { return 'unknown' }

  }

  /**
   * Gets file type by URL
   * @param url
   * @returns file type by URL
   */
  getFileTypeByURL(url: URL): string {
    const fileName = url.pathname.split('/').pop();
    if (fileName == undefined || fileName.length == 0) {
      return 'unknown';
    }
    let fileExtension = fileName.split('.').pop().toLowerCase();
    if (!fileExtension
      || fileExtension === 'jpeg' || fileExtension === 'jpg'
      || fileExtension === 'png' || fileExtension === 'bmp'
      || fileExtension === 'gif') {
      return 'image';
    } else if (fileExtension === 'avi' || fileExtension === 'flv'
      || fileExtension === 'wmv' || fileExtension === 'mov'
      || fileExtension === 'mp4') {
      return 'video';
    }
  }


}
