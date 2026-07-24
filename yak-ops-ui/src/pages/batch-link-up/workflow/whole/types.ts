import type { ReactNode } from "react";

export interface WholeSyncTaskDraft {
    source: {
        dbType: string;
        connectorType: string;
        datasourceId: string;
        pluginName: string;
        fetchSize: number;
        splitSize: number;
    };
    target: {
        dbType: string;
        connectorType: string;
        datasourceId: string;
        pluginName: string;
        dataSaveMode: any;
        batchSize: any;
        schemaSaveMode: any;
        enableUpsert: boolean;
        fieldIde: string;
    };
    tableMatch: {
        mode: "1" | "2" | "3" | "4";
        keyword?: string;
        tables?: string[];
    };
}



export interface TableItem {
    key: string;
    title: ReactNode;
    rawTitle: string;
    chosen?: boolean;
}

export interface DbType {
    dbType: string;
    connectorType: string;
    pluginName: string;
}