import os
import re

base_dir = "c:\\School-management-system\\Sms_backend\\src\\main\\java\\com\\Sms"
service_dir = os.path.join(base_dir, "service")
controller_dir = os.path.join(base_dir, "controller")

with open(os.path.join(service_dir, "SmsService.java"), "r") as f:
    sms_service_code = f.read()

with open(os.path.join(service_dir, "SmsServiceImpl.java"), "r") as f:
    sms_service_impl_code = f.read()

services = {
    "UserService": ["registerUser", "findUserByUsername", "findAllUsers"],
    "StudentService": ["saveStudent", "findAllStudents", "findStudentById", "findStudentByUsername", "findStudentsByClass", "deleteStudent"],
    "TeacherService": ["saveTeacher", "findAllTeachers", "findTeacherById", "findTeacherByUsername", "deleteTeacher"],
    "ClassService": ["saveClass", "findAllClasses", "findClassById", "deleteClass"],
    "SubjectService": ["saveSubject", "findAllSubjects", "findSubjectById", "findSubjectsByClass", "findSubjectsByTeacher", "deleteSubject"],
    "AttendanceService": ["saveAttendance", "getAttendance", "getStudentAttendance", "generateDailyAttendanceReport", "generateMonthlyAttendanceReport", "saveTeacherAttendance", "getTeacherAttendanceByDate"],
    "LeaveService": ["applyLeave", "getAllLeaveRequests", "getLeaveRequestsByUser", "updateLeaveStatus"],
    "HolidayService": ["saveHoliday", "getAllHolidays", "deleteHoliday"],
    "AnnouncementService": ["saveAnnouncement", "getAnnouncementsForUser", "getAllAnnouncements", "deleteAnnouncement"],
    "ExamService": ["saveExam", "getAllExams", "getExamsByClass", "deleteExam"],
    "ResultService": ["saveResult", "getResultsByExam", "getResultsByStudent", "deleteResult"],
    "FeeService": ["saveFee", "getFeesByStudent", "getAllFees", "recordFeePayment"],
    "TimetableService": ["saveTimetable", "getTimetableByClass", "getTimetableByTeacher", "deleteTimetable"],
    "DashboardService": ["getDashboardStats"]
}

# Add generation logic here
# I'll just write a java program or run a sed command?
# Actually, the parsing logic requires matching full method bodies. It's safer to do this with JavaParser or a regex that tracks brace counts.
# Let's write a simple python parser that tracks brace depth to extract methods.

def extract_method_impl(method_name, code):
    pattern = r"public\s+[\w<>\.,\s\[\]]+\s+" + method_name + r"\s*\("
    match = re.search(pattern, code)
    if not match:
        return ""
    start_idx = match.start()
    
    # backtrack to find @Override or other annotations
    lines_before = code[:start_idx].split('\n')
    prefix = ""
    for line in reversed(lines_before):
        if "@Override" in line or "@Transactional" in line:
            prefix = line + "\n" + prefix
        elif line.strip() == "":
            pass
        else:
            break

    # forward track to match braces
    idx = match.end()
    brace_depth = 0
    found_brace = False
    end_idx = idx
    for i in range(idx, len(code)):
        if code[i] == '{':
            brace_depth += 1
            found_brace = True
        elif code[i] == '}':
            brace_depth -= 1
        if found_brace and brace_depth == 0:
            end_idx = i + 1
            break
            
    return prefix + code[start_idx:end_idx] + "\n"

def extract_method_sig(method_name, code):
    pattern = r"[\w<>\.,\s\[\]]+\s+" + method_name + r"\s*\([^)]*\)\s*;"
    match = re.search(pattern, code)
    if not match:
        return ""
    return match.group(0)

# Generate Interfaces and Impls
for service_name, methods in services.items():
    interface_code = f"""package com.Sms.service;

import com.Sms.Dto.*;
import com.Sms.Entity.*;
import com.Sms.Enums.*;
import java.io.ByteArrayInputStream;
import java.util.List;

public interface {service_name} {{
"""
    for method in methods:
        sig = extract_method_sig(method, sms_service_code)
        interface_code += f"    {sig.strip()}\n"
    interface_code += "}\n"
    
    impl_name = f"{service_name}Impl"
    impl_code = f"""package com.Sms.service;

import com.Sms.Dto.*;
import com.Sms.Entity.*;
import com.Sms.Enums.*;
import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Service
public class {impl_name} implements {service_name} {{

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SchoolClassRepository schoolClassRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private TeacherAttendanceRepository teacherAttendanceRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private HolidayRepository holidayRepository;
    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private ExamRepository examRepository;
    @Autowired private ResultRepository resultRepository;
    @Autowired private FeeRepository feeRepository;
    @Autowired private TimetableRepository timetableRepository;
    @Autowired private PasswordEncoder encoder;

"""
    for method in methods:
        impl = extract_method_impl(method, sms_service_impl_code)
        # Fix indentation
        impl_code += "\n" + impl
        
    impl_code += "\n}\n"
    
    with open(os.path.join(service_dir, f"{service_name}.java"), "w") as f:
        f.write(interface_code)
        
    with open(os.path.join(service_dir, f"{impl_name}.java"), "w") as f:
        f.write(impl_code)

print("Generated services.")

# Now update controllers
controllers = os.listdir(controller_dir)
for controller_file in controllers:
    if not controller_file.endswith("Controller.java"):
        continue
        
    filepath = os.path.join(controller_dir, controller_file)
    with open(filepath, "r") as f:
        code = f.read()
        
    # Replace SmsService with matching service
    # E.g. StudentController uses StudentService
    service_prefix = controller_file.replace("Controller.java", "Service")
    
    # If the prefix is DashboardService, LeaveService etc it works.
    if service_prefix == "AuthController":
        service_prefix = "UserService"
    elif service_prefix == "SmsService":
        # Delete SmsController later
        continue
        
    if service_prefix in services:
        code = code.replace("private SmsService smsService;", f"private {service_prefix} {service_prefix[0].lower()}{service_prefix[1:]};")
        code = code.replace("smsService.", f"{service_prefix[0].lower()}{service_prefix[1:]}.")
        
        # also replace the import just in case, but they are in same package com.Sms.service.*
        
        with open(filepath, "w") as f:
            f.write(code)

print("Updated controllers.")
