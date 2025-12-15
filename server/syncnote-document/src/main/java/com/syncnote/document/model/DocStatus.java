package com.syncnote.document.model;

public enum DocStatus {
    Active,      // 正常
    Deleted,     // 软删除，放入回收站
    Archived;    // 归档 后续功能拓展可使用
}
