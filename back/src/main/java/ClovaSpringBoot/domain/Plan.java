package ClovaSpringBoot.domain;

import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Table(name="plans")
@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //기본키 1씩 자동 증가
    @Column(name = "plan_id", updatable = false)
    private Long id;

    @Column(name = "groupid" , nullable = true)
    private Long groupid;

    @Column(name = "realday" , nullable = false)
    private String realday;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_sn", nullable = false)
    private User user;

    @Column(name = "content" , nullable = false)
    private String content;

    @Column(name = "time" , nullable = false)
    private String time;

    @CreatedDate
    @Column(name="created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetailPlan> detailPlans = new ArrayList<>();

    @Builder //빌더패턴으로 객체 생성
    public Plan(Long groupid, String realday, String content, User user, String time, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.groupid = groupid;
        this.realday = realday;
        this.content = content;
        this.time = time;
        this.user = user;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public void update(String time, String content){
        this.time = time;
        this.content = content;
    }

}