import { Component, input, output, signal, WritableSignal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";



@Component({
    selector: "app-fuzzy-search",
    templateUrl: "./fuzzy-search.html",
    styleUrl: "./fuzzy-search.css",
    imports: [FormsModule, InputTextModule]
})
export class FuzzySearch<T> {

    readonly items = input.required<T[]>();
    readonly searchKey = input.required<keyof T>();
    readonly placeholder = input<string>('Buscar...');
    readonly resultados = output<T[]>();
    
    termino: WritableSignal<string> = signal('');

    onInput(valor: string): void {
        this.termino.set(valor);
        if (!valor) {
            this.resultados.emit(this.items());
            return;
        }
        const resultados = this.items()
            .map(item => ({ item, score: this.fuzzyScore(String(item[this.searchKey()]), valor) }))
            .filter(r => r.score > -1)
            .sort((a, b) => b.score - a.score)
            .map(r => r.item);

        this.resultados.emit(resultados);
    }

    limpiar(): void {
        this.termino.set('');
        this.resultados.emit(this.items());
    }

    private fuzzyScore(texto: string, patron: string): number {
        texto = texto.toLowerCase();
        patron = patron.toLowerCase();
        let i = 0;
        let score = 0;
        let consecutivos = 0;
        let primerMatch = -1;

        for (let j = 0; j < texto.length; j++) {
            if (texto[j] === patron[i]) {
                if (primerMatch === -1) primerMatch = j;
                consecutivos++;
                score += consecutivos * 2;
                i++;
            } else {
                consecutivos = 0;
            }
            if (i === patron.length) {
                score += Math.max(0, 10 - primerMatch);
                return score;
            }
        }
        return -1;
    }
}