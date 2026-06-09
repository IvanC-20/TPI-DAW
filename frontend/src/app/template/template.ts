import { Component, inject, signal, WritableSignal } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthStore } from "../auth/auth-store";

@Component({
    selector: 'app-template',
    templateUrl: './template.html',
    styleUrl: './template.css',
    imports: [ButtonModule, TooltipModule, RouterLink, RouterLinkActive]
})
export class Template {

    private readonly authStore: AuthStore = inject(AuthStore);

    readonly nombreUsuario = this.authStore.obtenerNombreUsuario();
    readonly fechaHoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    modoOscuro: WritableSignal<boolean> = signal(localStorage.getItem('tema') === 'dark');

    constructor() {
        if (this.modoOscuro()) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    toggleModo() {
        const oscuro = !this.modoOscuro();
        this.modoOscuro.set(oscuro);
        if (oscuro) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('tema', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('tema', 'light');
        }
    }

    cerrarSesion() {
        this.authStore.cerrarSesion();
    }

}
