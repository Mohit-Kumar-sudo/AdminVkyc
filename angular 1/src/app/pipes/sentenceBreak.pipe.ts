import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sentenceBreak' })
export class SentenceBreakPipe implements PipeTransform {

    transform(text: any, max: number, spaceCount: number, digit: number): any {
        if (text && text.length > max) {
            let text1 = text.slice(0, max).split(' ').slice(0, -1).join(' ')
            let text2 = text.slice(text1.length)
            let spaces = ""
            for (let i = 0; i < spaceCount; i++) spaces += '&nbsp;'
            if (typeof (digit) === "number") {
                var valAsString = digit.toString(10);
                if (valAsString.length !== 1) {
                    if (spaceCount % 2 == 0) {
                        spaces += '&nbsp;&nbsp;'
                    }
                }
            }
            return text1 + '</br>' + spaces + text2
        } else {
            return text
        }
    }
}