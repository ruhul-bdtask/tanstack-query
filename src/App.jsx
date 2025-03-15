import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
function App() {
  const {
    register,
    handleSubmit,
    reset, // To reset the form after updating
    setValue, // To set form values when editing
    formState: { errors },
  } = useForm();

  const instance = axios.create({
    timeout: 5000,
    baseURL: "http://localhost:5000",
  });

  const queryClient = useQueryClient();

  // Fetch users
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await instance.get("/users");
      return res.data;
    },
  });

  // Add User Mutation
  const mutationAdd = useMutation({
    mutationFn: async (userData) => {
      return await instance.post("/users", userData);
    },
    onSuccess: (data, variables, context) => {
      // console.log({ data });
      // console.log({ variables });
      // console.log({ context });
      queryClient.invalidateQueries(["users"]);
      reset();
    },
    onMutate: (data) => {
      console.log({ data });
      return { greetings: "Say Hello" };
    },
  });

  // Delete User Mutation
  const mutationDelete = useMutation({
    mutationFn: async (userId) => {
      return await instance.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
    onMutate: (data) => {
      console.log({ data });
      return { greetings: "Say Hello" };
    },
    onError: (error) => {
      console.error("Failed to delete user:", error);
    },
  });

  // Update User Mutation
  const mutationUpdate = useMutation({
    mutationFn: async ({ id, updatedData }) => {
      return await instance.put(`/users/${id}`, updatedData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["random"], {
        value: "Some random data",
      });
      queryClient.invalidateQueries(["users"]);
      reset(); // Reset form after update
      setEditingUser(null);
    },
    onMutate: (data) => {
      console.log({ dataForMutate: data });
      return { greetings: "Say Hello" };
    },
  });

  // Handle Delete
  const handleDelete = (userId) => {
    mutationDelete.mutate(userId);
  };

  // Track the user being edited
  const [editingUser, setEditingUser] = useState(null);

  // Handle Edit (Load Data into Form)
  const handleEdit = (user) => {
    setEditingUser(user);
    setValue("fname", user.fname);
    setValue("lname", user.lname);
    setValue("email", user.email);
    setValue("birthday", user.birthday);
  };

  // Handle Submit (Add or Update)
  const onSubmit = (userData) => {
    if (editingUser) {
      mutationUpdate.mutate({ id: editingUser.id, updatedData: userData });
    } else {
      const newData = { ...userData, id: crypto.randomUUID().toString() };
      mutationAdd.mutate(newData);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="border p-3 m-5 flex flex-col space-y-5 max-w-56">
          <legend className="font-semibold">
            {editingUser ? "Edit User" : "Add User"}
          </legend>

          <label htmlFor="fname">
            First name:
            <input
              {...register("fname", { required: "First name is required" })}
              type="text"
              id="fname"
              className="border rounded"
            />
            {errors.fname && (
              <span className="text-red-500 text-sm">
                {errors.fname.message}*
              </span>
            )}
          </label>

          <label htmlFor="lname">
            Last name:
            <input
              {...register("lname", { required: "Last name is required" })}
              type="text"
              id="lname"
              className="border rounded"
            />
            {errors.lname && (
              <span className="text-red-500 text-sm">
                {errors.lname.message}*
              </span>
            )}
          </label>

          <label htmlFor="email">
            Email:
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              id="email"
              className="border rounded"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}*
              </span>
            )}
          </label>

          <label htmlFor="birthday">
            Birthday:
            <input
              {...register("birthday", { required: "Birthday is required" })}
              type="date"
              id="birthday"
              className="border rounded"
            />
            {errors.birthday && (
              <span className="text-red-500 text-sm">
                {errors.birthday.message}*
              </span>
            )}
          </label>

          <input
            type="submit"
            value={editingUser ? "Update" : "Submit"}
            className="border rounded"
          />
          {editingUser && (
            <button
              type="button"
              className="border rounded bg-red-500 text-white"
              onClick={() => {
                reset(); // Clear form
                setEditingUser(null); // Exit edit mode
              }}
            >
              Cancel Edit
            </button>
          )}
        </fieldset>
      </form>

      <div className="border p-3 m-5 flex flex-col space-y-5 w-full max-w-96">
        <h2>User List</h2>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          users?.map((user) => (
            <div key={user.id} className="flex justify-between">
              <span className="">
                {user.fname} {user.lname}:
              </span>

              <div>
                <button
                  className="border rounded m-1 p-1 text-sm"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
                <button
                  className="border rounded m-1 p-1 text-sm"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
