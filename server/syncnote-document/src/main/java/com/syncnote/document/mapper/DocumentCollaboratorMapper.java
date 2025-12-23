package com.syncnote.document.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.syncnote.document.dto.response.UserSimpleInfo;
import com.syncnote.document.model.DocumentCollaborator;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

@Mapper
public interface DocumentCollaboratorMapper extends BaseMapper<DocumentCollaborator> {

    // 根据ID列表，批量查询用户名
    List<UserSimpleInfo> selectUserSimpleByIds(@Param("userIds") Collection<Long> userIds);
}
