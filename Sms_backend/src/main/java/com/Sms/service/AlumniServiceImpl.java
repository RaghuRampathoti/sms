package com.Sms.service;

import com.Sms.Entity.Alumni;
import com.Sms.Repository.AlumniRepository;
import com.Sms.Entity.SchoolClass;
import com.Sms.Repository.SchoolClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import com.Sms.Entity.AcademicYear;
import com.Sms.Entity.Student;
import com.Sms.Entity.StudentEnrollment;
import com.Sms.Entity.User;
import com.Sms.Enums.EnrollmentStatus;
import com.Sms.Repository.AcademicYearRepository;
import com.Sms.Repository.StudentEnrollmentRepository;
import com.Sms.Repository.StudentRepository;
@Service
public class AlumniServiceImpl implements AlumniService {

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private StudentEnrollmentRepository studentEnrollmentRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;
    
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Override
    public Alumni createAlumni(Alumni alumni) {
        return alumniRepository.save(alumni);
    }

    @Override
    public List<Alumni> getAllAlumni() {
        return alumniRepository.findAll();
    }

    @Override
    public Alumni getAlumniById(Long id) {
        return alumniRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alumni not found with id: " + id));
    }

    @Override
    public Alumni updateAlumni(Long id, Alumni alumniDetails) {
        Alumni alumni = getAlumniById(id);
        
        alumni.setFullName(alumniDetails.getFullName());
        alumni.setAdmissionNumber(alumniDetails.getAdmissionNumber());
        alumni.setRollNumber(alumniDetails.getRollNumber());
        alumni.setPassingYear(alumniDetails.getPassingYear());
        alumni.setDateOfBirth(alumniDetails.getDateOfBirth());
        alumni.setPhone(alumniDetails.getPhone());
        alumni.setEmail(alumniDetails.getEmail());
        alumni.setAddress(alumniDetails.getAddress());
        
        return alumniRepository.save(alumni);
    }

    @Override
    public void deleteAlumni(Long id) {
        Alumni alumni = getAlumniById(id);
        alumniRepository.delete(alumni);
    }

    @Override
    public void updateAlumniClassName(String oldName, String newName) {
        List<Alumni> alumniList;
        if ("Unassigned".equals(oldName)) {
            alumniList = alumniRepository.findByClassNameIsNull();
        } else {
            alumniList = alumniRepository.findByClassName(oldName);
        }
        for (Alumni alumni : alumniList) {
            alumni.setClassName(newName);
            alumniRepository.save(alumni);
        }
    }

    @Override
    public List<com.Sms.Dto.AlumniCandidateDto> getCandidatesForAlumni(Long academicYearId, Long classId) {
        List<StudentEnrollment> enrollments = studentEnrollmentRepository
                .findByAcademicYearIdAndSchoolClassIdAndStatus(academicYearId, classId, EnrollmentStatus.ACTIVE);
        
        List<com.Sms.Dto.AlumniCandidateDto> candidates = new ArrayList<>();
        
        for (StudentEnrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            User user = student.getUser();
            
            if (student.getAdmissionNumber() != null && alumniRepository.findByAdmissionNumber(student.getAdmissionNumber()).isPresent()) {
                continue;
            }
            
                com.Sms.Dto.AlumniCandidateDto dto = com.Sms.Dto.AlumniCandidateDto.builder()
                        .studentId(student.getId())
                        .fullName(user.getFullName())
                        .admissionNumber(student.getAdmissionNumber())
                        .rollNumber(enrollment.getRollNumber() != null ? enrollment.getRollNumber() : student.getRollNumber())
                        .className(enrollment.getSchoolClass().getClassName())
                        .academicYear(enrollment.getAcademicYear().getName())
                        .build();
                candidates.add(dto);
        }
        
        return candidates;
    }

    @Override
    public List<com.Sms.Dto.AlumniCandidateDto> getCandidatesByYear(int year) {
        // Find academic year whose name contains the given year string
        String yearStr = String.valueOf(year);
        List<AcademicYear> matchedYears = academicYearRepository.findByNameContaining(yearStr);
        if (matchedYears.isEmpty()) {
            return new ArrayList<>();
        }
        AcademicYear academicYear = matchedYears.get(0);

        // Find all classes whose name contains "10" (e.g. "10th", "Class 10", "10-A")
        List<SchoolClass> tenthClasses = schoolClassRepository.findByClassNameContainingIgnoreCase("10");
        if (tenthClasses.isEmpty()) {
            return new ArrayList<>();
        }

        List<com.Sms.Dto.AlumniCandidateDto> candidates = new ArrayList<>();

        for (SchoolClass cls : tenthClasses) {
            List<StudentEnrollment> enrollments = studentEnrollmentRepository
                    .findByAcademicYearIdAndSchoolClassIdAndStatus(academicYear.getId(), cls.getId(), EnrollmentStatus.ACTIVE);

            for (StudentEnrollment enrollment : enrollments) {
                Student student = enrollment.getStudent();
                User user = student.getUser();

                if (student.getAdmissionNumber() != null && alumniRepository.findByAdmissionNumber(student.getAdmissionNumber()).isPresent()) {
                    continue;
                }

                com.Sms.Dto.AlumniCandidateDto dto = com.Sms.Dto.AlumniCandidateDto.builder()
                        .studentId(student.getId())
                        .fullName(user.getFullName())
                        .admissionNumber(student.getAdmissionNumber())
                        .rollNumber(enrollment.getRollNumber() != null ? enrollment.getRollNumber() : student.getRollNumber())
                        .className(cls.getClassName())
                        .academicYear(academicYear.getName())
                        .build();
                candidates.add(dto);
            }
        }

        return candidates;
    }

    @Override
    public List<com.Sms.Dto.AlumniCandidateDto> getCandidatesByYearAndClass(int year, String className) {
        // Find academic year by name
        String yearStr = String.valueOf(year);
        List<AcademicYear> matchedYears = academicYearRepository.findByNameContaining(yearStr);
        if (matchedYears.isEmpty()) {
            return new ArrayList<>();
        }
        AcademicYear academicYear = matchedYears.get(0);

        // Find all classes whose name contains the given className (case-insensitive)
        List<SchoolClass> matchedClasses = schoolClassRepository.findByClassNameContainingIgnoreCase(className.trim());
        if (matchedClasses.isEmpty()) {
            return new ArrayList<>();
        }

        List<com.Sms.Dto.AlumniCandidateDto> candidates = new ArrayList<>();

        for (SchoolClass cls : matchedClasses) {
            List<StudentEnrollment> enrollments = studentEnrollmentRepository
                    .findByAcademicYearIdAndSchoolClassIdAndStatus(academicYear.getId(), cls.getId(), EnrollmentStatus.ACTIVE);

            for (StudentEnrollment enrollment : enrollments) {
                Student student = enrollment.getStudent();
                User user = student.getUser();

                if (student.getAdmissionNumber() != null && alumniRepository.findByAdmissionNumber(student.getAdmissionNumber()).isPresent()) {
                    continue;
                }

                com.Sms.Dto.AlumniCandidateDto dto = com.Sms.Dto.AlumniCandidateDto.builder()
                        .studentId(student.getId())
                        .fullName(user.getFullName())
                        .admissionNumber(student.getAdmissionNumber())
                        .rollNumber(enrollment.getRollNumber() != null ? enrollment.getRollNumber() : student.getRollNumber())
                        .className(cls.getClassName())
                        .academicYear(academicYear.getName())
                        .build();
                candidates.add(dto);
            }
        }

        return candidates;
    }

    @Override
    public List<com.Sms.Dto.AlumniCandidateDto> getCandidatesByActiveYearAndClass(String className) {
        // Use the currently active academic year
        AcademicYear academicYear = academicYearRepository.findByActiveTrue()
                .orElseThrow(() -> new RuntimeException("No active academic year found"));

        // Find classes matching the given name (case-insensitive)
        List<SchoolClass> matchedClasses = schoolClassRepository.findByClassNameContainingIgnoreCase(className.trim());
        if (matchedClasses.isEmpty()) {
            return new ArrayList<>();
        }

        List<com.Sms.Dto.AlumniCandidateDto> candidates = new ArrayList<>();

        for (SchoolClass cls : matchedClasses) {
            List<StudentEnrollment> enrollments = studentEnrollmentRepository
                    .findByAcademicYearIdAndSchoolClassIdAndStatus(academicYear.getId(), cls.getId(), EnrollmentStatus.ACTIVE);

            for (StudentEnrollment enrollment : enrollments) {
                Student student = enrollment.getStudent();
                User user = student.getUser();

                if (student.getAdmissionNumber() != null && alumniRepository.findByAdmissionNumber(student.getAdmissionNumber()).isPresent()) {
                    continue;
                }

                com.Sms.Dto.AlumniCandidateDto dto = com.Sms.Dto.AlumniCandidateDto.builder()
                        .studentId(student.getId())
                        .fullName(user.getFullName())
                        .admissionNumber(student.getAdmissionNumber())
                        .rollNumber(enrollment.getRollNumber() != null ? enrollment.getRollNumber() : student.getRollNumber())
                        .className(cls.getClassName())
                        .academicYear(academicYear.getName())
                        .build();
                candidates.add(dto);
            }
        }

        return candidates;
    }

    @Override
    public List<com.Sms.Dto.AlumniCandidateDto> getCandidatesByYearIdAndClass(Long academicYearId, String className) {
        AcademicYear academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new RuntimeException("Academic year not found"));

        List<SchoolClass> matchedClasses = schoolClassRepository.findByClassNameContainingIgnoreCase(className.trim());
        if (matchedClasses.isEmpty()) {
            return new ArrayList<>();
        }

        List<com.Sms.Dto.AlumniCandidateDto> candidates = new ArrayList<>();

        for (SchoolClass cls : matchedClasses) {
            // Check if class belongs to the given academic year
            if (cls.getAcademicYear() == null || !cls.getAcademicYear().getId().equals(academicYear.getId())) {
                continue;
            }

            List<Student> students = studentRepository.findBySchoolClassId(cls.getId());

            for (Student student : students) {
                User user = student.getUser();

                if (student.getAdmissionNumber() != null && alumniRepository.findByAdmissionNumber(student.getAdmissionNumber()).isPresent()) {
                    continue;
                }

                com.Sms.Dto.AlumniCandidateDto dto = com.Sms.Dto.AlumniCandidateDto.builder()
                        .studentId(student.getId())
                        .fullName(user.getFullName())
                        .admissionNumber(student.getAdmissionNumber())
                        .rollNumber(student.getRollNumber())
                        .className(cls.getClassName())
                        .academicYear(academicYear.getName())
                        .build();
                candidates.add(dto);
            }
        }

        return candidates;
    }

    @Override
    public List<com.Sms.Dto.AlumniCandidateDto> getCandidatesByDates(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        java.util.Optional<AcademicYear> yearOpt = academicYearRepository.findByStartDateAndEndDate(startDate, endDate);
        if (yearOpt.isEmpty()) {
            return new ArrayList<>();
        }
        AcademicYear academicYear = yearOpt.get();

        List<SchoolClass> tenthClasses = schoolClassRepository.findByClassNameContainingIgnoreCase("10");
        if (tenthClasses.isEmpty()) {
            return new ArrayList<>();
        }

        List<com.Sms.Dto.AlumniCandidateDto> candidates = new ArrayList<>();

        for (SchoolClass cls : tenthClasses) {
            List<StudentEnrollment> enrollments = studentEnrollmentRepository
                    .findByAcademicYearIdAndSchoolClassIdAndStatus(academicYear.getId(), cls.getId(), EnrollmentStatus.ACTIVE);

            for (StudentEnrollment enrollment : enrollments) {
                Student student = enrollment.getStudent();
                User user = student.getUser();

                if (student.getAdmissionNumber() != null && alumniRepository.findByAdmissionNumber(student.getAdmissionNumber()).isPresent()) {
                    continue;
                }

                com.Sms.Dto.AlumniCandidateDto dto = com.Sms.Dto.AlumniCandidateDto.builder()
                        .studentId(student.getId())
                        .fullName(user.getFullName())
                        .admissionNumber(student.getAdmissionNumber())
                        .rollNumber(enrollment.getRollNumber() != null ? enrollment.getRollNumber() : student.getRollNumber())
                        .className(cls.getClassName())
                        .academicYear(academicYear.getName())
                        .build();
                candidates.add(dto);
            }
        }

        return candidates;
    }

    @Override
    public List<Alumni> bulkTransferToAlumni(Long academicYearId, List<Long> studentIds) {
        // If no academicYearId provided, use the active academic year
        AcademicYear year;
        if (academicYearId != null) {
            year = academicYearRepository.findById(academicYearId)
                    .orElseThrow(() -> new RuntimeException("Academic Year not found"));
        } else {
            year = academicYearRepository.findByActiveTrue()
                    .orElseThrow(() -> new RuntimeException("No active academic year found"));
        }
        
        Integer passingYear = year.getEndDate().getYear();
        
        List<Alumni> newlyAdded = new ArrayList<>();
        
        for (Long studentId : studentIds) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
            User user = student.getUser();
            
            if (student.getAdmissionNumber() != null && alumniRepository.findByAdmissionNumber(student.getAdmissionNumber()).isPresent()) {
                continue;
            }
            
            Alumni alumni = Alumni.builder()
                    .fullName(user.getFullName())
                    .admissionNumber(student.getAdmissionNumber())
                    .rollNumber(student.getRollNumber())
                    .passingYear(passingYear)
                    .dateOfBirth(student.getDateOfBirth())
                    .phone(student.getParentPhone() != null ? student.getParentPhone() : user.getPhoneNumber())
                    .email(user.getEmail())
                    .className(student.getSchoolClass() != null ? student.getSchoolClass().getClassName() : null)
                    .build();
            
            alumniRepository.save(alumni);
            newlyAdded.add(alumni);
        }
        
        return newlyAdded;
    }
}
