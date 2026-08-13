import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useProfile, useUpdateProfile, useUploadResume } from "../hooks/useProfile";
import TagInput from "../components/TagInput";
import LoadingSpinner from "../components/LoadingSpinner";

const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Lead", "Executive"];

export default function Profile() {
  const { data: user, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadResume = useUploadResume();
  const fileInputRef = useRef(null);
  const [savedAt, setSavedAt] = useState(null);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      skills: [],
      preferences: {
        targetRoles: [],
        locations: [],
        remote: false,
        salaryMin: "",
        salaryMax: "",
        experienceLevel: "Mid",
      },
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name ?? "",
      skills: user.skills ?? [],
      preferences: {
        targetRoles: user.preferences?.targetRoles ?? [],
        locations: user.preferences?.locations ?? [],
        remote: user.preferences?.remote ?? false,
        salaryMin: user.preferences?.salaryMin ?? "",
        salaryMax: user.preferences?.salaryMax ?? "",
        experienceLevel: user.preferences?.experienceLevel ?? "Mid",
      },
    });
  }, [user, reset]);

  const onSubmit = (values) => {
    updateProfile.mutate(
      {
        name: values.name,
        skills: values.skills,
        preferences: {
          ...values.preferences,
          salaryMin: values.preferences.salaryMin ? Number(values.preferences.salaryMin) : null,
          salaryMax: values.preferences.salaryMax ? Number(values.preferences.salaryMax) : null,
        },
      },
      { onSuccess: () => setSavedAt(Date.now()) }
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadResume.mutate(file);
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading profile..." />;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <p className="mt-1 text-sm text-slate-400">
        Tell ApplyIQ what you're looking for. This drives job matching, CV generation, and the
        orchestration agent.
      </p>

      <section className="mt-6 rounded-xl border border-white/10 bg-navy-light/40 p-6">
        <h2 className="font-semibold text-white">Resume</h2>
        <p className="mt-1 text-sm text-slate-400">
          Upload a PDF to auto-extract your skills and experience.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadResume.isPending}
            className="rounded-md bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:opacity-60"
          >
            {uploadResume.isPending ? "Parsing..." : "Upload PDF"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {user?.resumeStructured && (
            <span className="text-xs text-lime">
              Parsed {user.resumeStructured.skills?.length ?? 0} skills from resume
            </span>
          )}
          {uploadResume.isError && (
            <span className="text-xs text-red-400">
              {uploadResume.error?.response?.data?.message || "Upload failed"}
            </span>
          )}
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <section className="rounded-xl border border-white/10 bg-navy-light/40 p-6">
          <h2 className="font-semibold text-white">Basics</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Full name</label>
              <input
                {...register("name")}
                className="w-full rounded-md border border-white/10 bg-navy px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
              />
            </div>
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Skills"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type a skill and press Enter"
                />
              )}
            />
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-navy-light/40 p-6">
          <h2 className="font-semibold text-white">Job preferences</h2>
          <div className="mt-4 space-y-4">
            <Controller
              name="preferences.targetRoles"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Target roles"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              )}
            />
            <Controller
              name="preferences.locations"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Locations"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="e.g. London, Berlin"
                />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Salary min</label>
                <input
                  type="number"
                  {...register("preferences.salaryMin")}
                  className="w-full rounded-md border border-white/10 bg-navy px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Salary max</label>
                <input
                  type="number"
                  {...register("preferences.salaryMax")}
                  className="w-full rounded-md border border-white/10 bg-navy px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Experience level</label>
              <select
                {...register("preferences.experienceLevel")}
                className="w-full rounded-md border border-white/10 bg-navy px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" {...register("preferences.remote")} className="rounded" />
              Open to remote roles
            </label>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="rounded-md bg-electric px-4 py-2 text-sm font-semibold text-navy hover:bg-electric-light disabled:opacity-60"
          >
            {updateProfile.isPending ? "Saving..." : "Save profile"}
          </button>
          {savedAt && <span className="text-xs text-lime">Saved</span>}
        </div>
      </form>
    </div>
  );
}
