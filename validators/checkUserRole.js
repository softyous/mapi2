const check_user_role = async (task, role, field) => {
    const admin_fields = [ 'pupils', 'subjects', 'classes', 'users', 'streams' ]
    const teacher_fields = [ 'attendences', 'exams', 'performances' ]

    if(role !== 'Administrator' || role !== 'Teacher' || !role) {
        return false;
    }

    if(task === 'Create' || task === 'Update' || task === 'Delete') {
        if(role === 'Administrator' && admin_fields.includes(field)) {
            return true;
        } else if(role === 'Teacher' && teacher_fields.includes(field)) {
            return true;
        } else {
            return false;
        }
    }
};

module.exports = check_user_role;
