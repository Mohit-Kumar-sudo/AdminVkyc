import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatCustomData' })
export class FormatCustomDataPipe implements PipeTransform {

    transform(text: any): any {
        if (Array.isArray(text)) {
            text = text[0]
        }
        if (text.includes("<li>") && text.includes("</li>")) {
            text = text.replace(/<li>/gi, '<li><div><p>')
            text = text.replace(/<\/li>/gi, '</div></p></li>')
        }
        return text
    }
}