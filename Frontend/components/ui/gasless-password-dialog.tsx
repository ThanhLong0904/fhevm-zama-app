import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, Zap, CheckCircle } from "lucide-react";
import {
  useEnhancedPasswordValidation,
  RoomValidationFunctions,
} from "@/hooks/useEnhancedPasswordValidation";
import { useGaslessTransactions } from "@/services/gaslessTransactions";
import { VotingRoomABI } from "@/abi/VotingRoomABI";
import { ethers } from "ethers";

interface GaslessPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomCode: string;
  roomTitle: string;
  roomValidationFunctions: RoomValidationFunctions;
  signer?: ethers.JsonRpcSigner;
  contractAddress: string;
}

export function GaslessPasswordDialog({
  isOpen,
  onClose,
  onSuccess,
  roomCode,
  roomTitle,
  roomValidationFunctions,
  signer,
  contractAddress,
}: GaslessPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { validateRoomPasswordWithCache, isValidating } =
    useEnhancedPasswordValidation();
  const { executeGaslessJoinRoom } = useGaslessTransactions({
    contractAddress,
    contractABI: VotingRoomABI.abi,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      // Step 1: Validate password using enhanced validation with caching
      const result = await validateRoomPasswordWithCache(
        roomCode,
        password,
        roomValidationFunctions
      );

      if (!result.isValid) {
        // Invalid password or other error
        setError(result.error || "Invalid password. Please try again.");
        setPassword(""); // Clear password on error for security
        return;
      }

      // Step 2: Handle the result based on whether transaction is needed
      if (result.isAlreadyParticipant) {
        // User is already a participant - no transaction needed, direct access
        console.log("User is already a participant, providing direct access");
        if (result.fromCache) {
          console.log("Authentication validated from cache");
          setSuccessMessage("Password verified from cache - quick access!");
          // Brief success message before navigating
          setTimeout(() => {
            setPassword("");
            setError("");
            setSuccessMessage("");
            onSuccess();
            onClose();
          }, 1000);
        } else {
          setPassword("");
          setError("");
          onSuccess();
          onClose();
        }
      } else if (result.requiresTransaction) {
        // User needs to join the room - execute gasless transaction
        if (!signer) {
          setError("Wallet connection required to join the room.");
          return;
        }

        setIsJoiningRoom(true);
        const userAddress = await signer.getAddress();

        const gaslessResult = await executeGaslessJoinRoom(
          roomCode,
          password,
          userAddress,
          signer
        );

        if (gaslessResult.success) {
          console.log(
            "Successfully joined room via gasless transaction:",
            gaslessResult.transactionHash
          );
          setPassword("");
          setError("");
          onSuccess();
          onClose();
        } else {
          setError(
            gaslessResult.error || "Failed to join room. Please try again."
          );
          setPassword("");
        }
        setIsJoiningRoom(false);
      } else {
        // This shouldn't happen, but handle gracefully
        setPassword("");
        setError("");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Password validation error:", error);
      setError("An unexpected error occurred. Please try again.");
      setPassword("");
      setIsJoiningRoom(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  const isLoading = isValidating || isJoiningRoom;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-yellow-400" />
            Enter Room Password
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            This room requires a password to enter: <strong>{roomTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Enter room password"
                disabled={isLoading}
                autoFocus
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}

            {/* Success indicator for cached authentication */}
            {successMessage && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Gasless transaction benefit indicator */}
            <div className="text-xs text-gray-500 bg-green-50 border border-green-200 rounded p-2 flex items-center gap-2">
              <Zap className="h-3 w-3 text-green-600" />
              <span>No gas fees required - seamless room entry!</span>
            </div>

            {isJoiningRoom && (
              <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded p-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Joining room securely...</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isValidating ? "Validating..." : "Joining..."}
                </>
              ) : (
                "Enter Room"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
