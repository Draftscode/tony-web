import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, contentChild, input, TemplateRef } from "@angular/core";
import { TreeNode } from "primeng/api";

@Component({
    selector: 'app-tree',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet],
    templateUrl: 'tree.component.html'
})
export class TreeComponent {
    items = input<TreeNode[]>([]);
    nodeRef = contentChild<TemplateRef<unknown>>('node');
}