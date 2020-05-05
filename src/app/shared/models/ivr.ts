import {IvrNode} from "./ivr-node";

export class IVR {
    table_name: string = 'IVR';
    module_id: number;
    description: string;
    ivr_node_list: IvrNode[];
    next_mid: number;
}

