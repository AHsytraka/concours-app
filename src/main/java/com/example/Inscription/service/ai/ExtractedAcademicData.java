package com.example.Inscription.service.ai;

import lombok.Data;
import java.time.LocalDate;
import java.util.*;

@Data
public class ExtractedAcademicData {
    private String studentFirstName;
    private String studentLastName;
    private String studentCIN;
    private LocalDate studentBirthDate;
    private String schoolName;
    private String academicYear;
    private Double averageGrade;
    private List<GradeRecord> grades = new ArrayList<>();
    private LocalDate documentDate;
    private Boolean isValid = false;
    
    @Data
    public static class GradeRecord {
        private String subjectName;
        private Double grade;
        private Double coefficient;
    }
}
