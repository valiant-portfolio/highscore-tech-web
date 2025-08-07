import React, { useState } from 'react'
import { 
  Timeline, 
  CheckCircle, 
  RadioButtonUnchecked, 
  PlayCircleOutline, 
  Assignment, 
  Quiz,
  TrendingUp,
  Grade,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'
import 'animate.css'

export default function ProgressTracker({ studentData }) {
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (moduleIndex) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  };

  const getModuleProgress = (moduleIndex) => {
    const moduleProgress = studentData?.progress?.modules?.[moduleIndex];
    if (!moduleProgress) return 0;
    
    const totalTopics = studentData?.course?.modules?.[moduleIndex]?.topics?.length || 0;
    const completedTopics = moduleProgress.completedTopics?.length || 0;
    
    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  };

  const getOverallProgress = () => {
    if (!studentData?.course?.modules) return 0;
    
    const totalModules = studentData.course.modules.length;
    let totalProgress = 0;
    
    studentData.course.modules.forEach((_, index) => {
      totalProgress += getModuleProgress(index);
    });
    
    return Math.round(totalProgress / totalModules);
  };

  const getModuleStatus = (moduleIndex) => {
    const progress = getModuleProgress(moduleIndex);
    const currentModule = studentData?.progress?.currentModule || 1;
    
    if (progress === 100) return 'completed';
    if (moduleIndex + 1 === currentModule) return 'current';
    if (moduleIndex + 1 < currentModule) return 'completed';
    return 'locked';
  };

  const formatDuration = (duration) => {
    return duration || 'TBD';
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-400';
    if (grade >= 80) return 'text-blue-400';
    if (grade >= 70) return 'text-yellow-400';
    if (grade >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6 animate__animated animate__fadeInUp animate__delay-2s">
      {/* Progress Overview */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ec4899] mr-4">
            <TrendingUp className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Learning Progress</h3>
            <p className="text-[#e2e8f0]">Track your course completion and performance</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Overall Course Progress</span>
            <span>{getOverallProgress()}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
              style={{ width: `${getOverallProgress()}%` }}
            >
              {getOverallProgress() > 10 && (
                <span className="text-white text-xs font-bold">{getOverallProgress()}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-[#10b981]/20 to-[#059669]/20 rounded-xl border border-[#10b981]/30">
            <p className="text-[#10b981] text-sm font-medium">Modules Completed</p>
            <p className="text-white text-2xl font-bold">
              {studentData?.progress?.modulesCompleted || 0}/{studentData?.course?.modules?.length || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 rounded-xl border border-[#2563eb]/30">
            <p className="text-[#06b6d4] text-sm font-medium">Average Grade</p>
            <p className={`text-2xl font-bold ${getGradeColor(studentData?.progress?.averageGrade || 0)}`}>
              {studentData?.progress?.averageGrade || 0}%
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-[#f97316]/20 to-[#f59e0b]/20 rounded-xl border border-[#f97316]/30">
            <p className="text-[#f97316] text-sm font-medium">Assignments</p>
            <p className="text-white text-2xl font-bold">
              {studentData?.progress?.assignmentsCompleted || 0}/{studentData?.progress?.totalAssignments || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-[#ec4899]/20 to-[#f472b6]/20 rounded-xl border border-[#ec4899]/30">
            <p className="text-[#ec4899] text-sm font-medium">Attendance</p>
            <p className="text-white text-2xl font-bold">{studentData?.attendance || 0}%</p>
          </div>
        </div>
      </div>

      {/* Module Progress */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
          <Timeline className="mr-3 text-[#60a5fa]" />
          Module Progress
        </h3>

        <div className="space-y-4">
          {studentData?.course?.modules?.map((module, index) => {
            const moduleStatus = getModuleStatus(index);
            const moduleProgress = getModuleProgress(index);
            const isExpanded = expandedModules[index];
            const moduleGrade = studentData?.progress?.modules?.[index]?.grade;

            return (
              <div key={index} className="border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleModule(index)}
                  className={`w-full p-4 flex items-center justify-between text-left transition-all duration-300 ${
                    moduleStatus === 'completed' 
                      ? 'bg-green-500/10 hover:bg-green-500/20' 
                      : moduleStatus === 'current'
                      ? 'bg-blue-500/10 hover:bg-blue-500/20'
                      : 'bg-gray-500/10 hover:bg-gray-500/20'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <div className={`p-2 rounded-lg mr-4 ${
                      moduleStatus === 'completed' 
                        ? 'bg-green-500' 
                        : moduleStatus === 'current'
                        ? 'bg-blue-500'
                        : 'bg-gray-500'
                    }`}>
                      {moduleStatus === 'completed' ? (
                        <CheckCircle className="text-white text-sm" />
                      ) : moduleStatus === 'current' ? (
                        <PlayCircleOutline className="text-white text-sm" />
                      ) : (
                        <RadioButtonUnchecked className="text-white text-sm" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold">{module.title}</h4>
                        <div className="flex items-center space-x-4">
                          {moduleGrade && (
                            <span className={`text-sm font-bold ${getGradeColor(moduleGrade)}`}>
                              {moduleGrade}%
                            </span>
                          )}
                          <span className="text-[#e2e8f0] text-sm">{formatDuration(module.duration)}</span>
                          <div className="flex items-center">
                            <div className="w-20 h-2 bg-gray-700 rounded-full mr-3">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  moduleStatus === 'completed' 
                                    ? 'bg-green-500' 
                                    : moduleStatus === 'current'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-500'
                                }`}
                                style={{ width: `${moduleProgress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-[#e2e8f0] w-8">{moduleProgress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded ? (
                    <ExpandLess className="text-[#60a5fa] ml-2" />
                  ) : (
                    <ExpandMore className="text-[#60a5fa] ml-2" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-black/20 animate__animated animate__fadeIn">
                    {/* Topics */}
                    <div className="mb-4">
                      <h5 className="text-white font-medium mb-3 flex items-center">
                        <Assignment className="mr-2 text-[#60a5fa] text-sm" />
                        Topics ({module.topics?.length || 0})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {module.topics?.map((topic, topicIndex) => {
                          const isTopicCompleted = studentData?.progress?.modules?.[index]?.completedTopics?.includes(topicIndex);
                          
                          return (
                            <div key={topicIndex} className="flex items-center p-2 rounded-lg bg-white/5">
                              <div className={`p-1 rounded mr-3 ${
                                isTopicCompleted ? 'bg-green-500' : 'bg-gray-500'
                              }`}>
                                {isTopicCompleted ? (
                                  <CheckCircle className="text-white text-xs" />
                                ) : (
                                  <RadioButtonUnchecked className="text-white text-xs" />
                                )}
                              </div>
                              <span className={`text-sm ${isTopicCompleted ? 'text-white' : 'text-[#e2e8f0]'}`}>
                                {topic}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Assignments and Quizzes */}
                    {studentData?.progress?.modules?.[index]?.assignments && (
                      <div>
                        <h5 className="text-white font-medium mb-3 flex items-center">
                          <Quiz className="mr-2 text-[#60a5fa] text-sm" />
                          Assignments & Quizzes
                        </h5>
                        <div className="space-y-2">
                          {studentData.progress.modules[index].assignments.map((assignment, assIndex) => (
                            <div key={assIndex} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center">
                                <div className={`p-1 rounded mr-3 ${
                                  assignment.completed ? 'bg-green-500' : 'bg-yellow-500'
                                }`}>
                                  <Grade className="text-white text-xs" />
                                </div>
                                <span className="text-white text-sm">{assignment.title}</span>
                              </div>
                              <div className="text-right">
                                {assignment.grade && (
                                  <span className={`text-sm font-bold ${getGradeColor(assignment.grade)}`}>
                                    {assignment.grade}%
                                  </span>
                                )}
                                <p className="text-xs text-[#e2e8f0]">
                                  {assignment.completed ? 'Completed' : 'Pending'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {studentData?.progress?.recentActivity && (
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <Timeline className="mr-3 text-[#10b981]" />
            Recent Activity
          </h3>

          <div className="space-y-3">
            {studentData.progress.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className={`p-2 rounded-lg mr-4 ${
                  activity.type === 'completed' ? 'bg-green-500' :
                  activity.type === 'assignment' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`}>
                  {activity.type === 'completed' ? (
                    <CheckCircle className="text-white text-sm" />
                  ) : activity.type === 'assignment' ? (
                    <Assignment className="text-white text-sm" />
                  ) : (
                    <Quiz className="text-white text-sm" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-[#e2e8f0] text-sm">{activity.description}</p>
                  <p className="text-[#60a5fa] text-xs">{activity.date}</p>
                </div>
                
                {activity.score && (
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getGradeColor(activity.score)}`}>
                      {activity.score}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
