import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, untracked, viewChild } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { Button } from "primeng/button";
import { Card } from "primeng/card";
import { TextareaModule } from "primeng/textarea";
import { DataFile } from "../../../../data-access/provider/file.service";
import { AccountStore } from "../../../../data-access/store/account.store";
import { MessageStore } from "../../../../data-access/store/message.store";

@Component({
    selector: 'app-chat',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'chat.component.html',
    providers: [MessageStore],
    imports: [TextareaModule, Card, Button, TranslatePipe, DatePipe]
})
export class ChatComponent {
    private readonly accountStore = inject(AccountStore)
    protected readonly messageStore = inject(MessageStore);

    protected readonly userId = computed(() => this.accountStore.me.hasValue() ? this.accountStore.me.value()?.id : null);

    protected readonly messages = computed(() => this.messageStore.messages.hasValue() ? this.messageStore.messages.value() : { items: [], total: 0 });
    protected readonly scroller = viewChild<ElementRef>('scroller');
    filename = input.required<string>();
    file = input.required<DataFile>();

    constructor() {
        this.messageStore.connectFile(this.filename);
        this.messageStore.connectUser(this.userId);

        effect(() => {
            const file = this.file();
            untracked(async () => {
                if (!file.messages?.length) { return; }
                for (const m of file.messages) {
                    await this.messageStore.readMessage(m.id);
                }
            })
        })

        effect(() => {

            const s = this.scroller()?.nativeElement;
            this.messages();
            if (!s || !this.messages()) { return; }
            s.scrollTop = s.scrollHeight;
        })
    }

    ngAfterViewInit() {
    }
}